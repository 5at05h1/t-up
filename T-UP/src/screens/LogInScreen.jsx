import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Platform, AppState, Linking, LogBox
} from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import VersionCheck from 'react-native-version-check-expo';
import * as SQLite from "expo-sqlite";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

import Loading from '../components/Loading';
import { CreateDB, GetDB,db_select,db_write} from '../components/Databace';

// DB接続
const db = SQLite.openDatabase("db");

// oishi グローバル変数
global.sp_token = ''; // スマホトークン
global.sp_id = '';    // ログインID

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// let domain = 'http://test.t-up.systems/';
let domain = 'https://www.t-up.systems/';

export default function LogInScreen(props) {
  
  // 現在利用しているアプリのバージョンを取得する
  const appVersion = VersionCheck.getCurrentVersion();
  
  if (AppState.currentState === 'active') {
    Notifications.setBadgeCountAsync(0);
  }

  const { navigation,route } = props;
  const cus_notifications = route.params;
  
  const [isLoading, setLoading] = useState(false);
  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  
  const [station,setStation] = useState([]);
  const [address,setAddress] = useState([]);
  
  const [rocalDB,setRocalDB] = useState([]);
  
  const[ExpoPushToken,setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  useEffect(() => {
    
    registerForPushNotificationsAsync();
    
    // メッセージ受信時
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
    
    // 通知をタップしたらログイン → お客様一覧 → トーク画面 (ログインしていなかったら)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.notification.request.content.data.customer && !global.sp_id) {
    
        const cus_data = response.notification.request.content.data.customer;
        
        navigation.navigate(
          'LogIn',
          {
            customer_id: cus_data.customer_id,
            name: cus_data.name,
          }
        );
        
      }
    })
    
    fetch(domain+'js/appversion.json')
    .then((response) => response.json())
    .then((json) => {

      var latestAppVersion = json.version;
      
      // 新しいバージョンのアプリがストアに配布されている場合は更新を促す
      if (appVersion < latestAppVersion) {
        
        Alert.alert("更新情報", "新しいバージョンが利用可能です。最新版にアップデートしてご利用ください。", [
          { text: "後で通知", style: "cancel" },
          { text: "アップデート", onPress: () => {
            if (Platform.OS === "ios") {
              const appId = 1606133167; // AppStoreのURLから確認できるアプリ固有の数値
              const itunesURLScheme = `itms-apps://itunes.apple.com/jp/app/id${appId}?mt=8`;
              const itunesURL = `https://itunes.apple.com/jp/app/id${appId}?mt=8`;
          
              Linking.canOpenURL(itunesURLScheme).then(supported => {
                // AppStoreアプリが開ける場合はAppStoreアプリで開く。開けない場合はブラウザで開く。
                if (supported) {
                  Linking.openURL(itunesURLScheme);
                } else {
                  Linking.openURL(itunesURL);
                }
              });
            } else {
              const appId = "com.TUP_CRM"; // PlayストアのURLから確認できるid=?の部分
              const playStoreURLScheme = `market://details?id=${appId}`;
              const playStoreURL = `https://play.google.com/store/apps/details?id=${appId}`;
          
              Linking.canOpenURL(playStoreURLScheme).then(supported => {
                // Playストアアプリが開ける場合はPlayストアアプリで開く。開けない場合はブラウザで開く。
                if (supported) {
                  Linking.openURL(playStoreURLScheme);
                } else {
                  Linking.openURL(playStoreURL);
                }
              });
            }
          }}
        ]);
        
      }
    })
    .catch((error) => {
      console.log('バージョン取得失敗');
      console.log(error);
    })
    
    // ローカルDBでログイン(同期処理)
    const execute = async() => {

      console.log('--------------------------------')

      setLoading(true);

      const toast = (text) => Toast.show(text, {
        duration: Toast.durations.LONG,
        position: 0,
        shadow: true,
        animation: true,
        backgroundColor:'#333333',
        opacity:0.6,
      });
      
      // 駅・沿線
      const set_station = async() => {
        var station_ = await db_select(`select count(*) as cnt from station_mst;`);
        var cnt = station_[0]["cnt"];
        
        if (cnt == 0) {
          function getStation(){
            return new Promise((resolve, reject)=>{
              fetch(domain+'js/data/reins.json')
              .then((response) => response.json())
              .then((json) => {
                resolve(json);
              })
              .catch((error) => {
                console.log('駅・沿線取得失敗');
                console.log(error);
                resolve(false);
              })
            })
          }
          toast('データベース更新中\n少々お待ちください');
          const GS = await getStation();
          if (GS) await Insert_station_db(GS);
        } else {
          setStation(true);
        }
      }
      
      // エリア
      const set_area = async() => {
        var address_ = await db_select(`select count(*) as cnt from address_mst;`);
        var cnt = address_[0]["cnt"];

        if (cnt == 0) {
          function getAddress(){
            return new Promise((resolve, reject)=>{
              fetch(domain+'js/data/address.json')
              .then((response) => response.json())
              .then((json) => {
                resolve(json);
              })
              .catch((error) => {
                console.log('エリア取得失敗');
                console.log(error);
                resolve(false);
              })
            })
          }

          const GA = await getAddress();
          if (GA) await Insert_area_db(GA);
        } else {
          setAddress(true);
        }
      }
      
      await CreateDB();
      await set_station();
      await set_area();
      
      // ※ログイン制御の為、最後に処理
      const staff_mst = await GetDB('staff_mst');
      if (staff_mst != false) {
        
        let toast = Toast.show('自動ログインしています', {
          duration: Toast.durations.SHORT,
          position: 200,
          shadow: true,
          animation: true,
          backgroundColor:'#333333',
        });

        setRocalDB(staff_mst);
      }
      
      setLoading(false);

    }
    execute();
    
  }, []);
  
  // 取得したトークンで自動ログイン
  useEffect(() => {
    
    if (station && address) {
      if (rocalDB.length != 0) {

        let toast = Toast.show('自動ログインしています', {
          duration: Toast.durations.SHORT,
          position: 200,
          shadow: true,
          animation: true,
          backgroundColor:'#333333',
        });

        // websocket通信
        const WS_URL = 'ws://52.194.19.123:8080/ws/'+rocalDB[0].shop_id+'/'
        
        // ログインデータ保持用
        global.sp_id = rocalDB.account;
        setLoading(false);

        // ローカルサーバーのデータを更新(サーバーから取得)
        getServerData(rocalDB[0]);
        
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory',
            params: rocalDB[0],
            websocket:new WebSocket(WS_URL),
            station:station,
            address:address,
            flg:'ローカル',
            previous:'LogIn',
            notifications:cus_notifications?cus_notifications:null,
          }],
        });

      } else if (rocalDB.length == 0 && ExpoPushToken) {
        
        fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: JSON.stringify({
            sp_token : ExpoPushToken,
          })
        })
        .then((response) => response.json())
        .then(async(json) => {
          
          let toast = Toast.show('自動ログインしています', {
            duration: Toast.durations.SHORT,
            position: 200,
            shadow: true,
            animation: true,
            backgroundColor:'#333333',
          });
          
          // ログインデータ保持用
          global.sp_id = json.staff.account;
          
          // websocket通信
          const WS_URL = 'ws://52.194.19.123:8080/ws/'+json.staff.shop_id+'/'
          
          const staff = json.staff;

          const staff_data = [
            staff.account,
            staff.password,
            staff.shop_id,
            staff.name_1,
            staff.name_2,
            staff.name,
            staff.corporations_name,
            staff.setting_list,
            staff.app_token,
            staff.system_mail,
            staff.yahoomail,
            staff.gmail,
            staff.hotmail,
            staff.outlook,
            staff.softbank,
            staff.icloud,
            staff.original_mail,
            staff.line_id,
            staff.mail_name,
            staff.mail1,
            staff.mail2,
            staff.mail3,
            staff.top_staff_list,
            staff.setting_list7_mail,
          ];
          
          await Insert_staff_db(staff.account,staff.password,staff_data);
          
          navigation.reset({
            index: 0,
            routes: [{
              name: 'CommunicationHistory',
              params: json.staff,
              websocket:new WebSocket(WS_URL),
              station:station,
              address:address,
              flg:'トークン',
              previous:'LogIn',
              notifications:cus_notifications?cus_notifications:null,
            }],
          });
      
        })
        .catch((error) => {
          console.log('トークンログイン失敗');
          console.log(error);
        })
      }
    }
    
  }, [station,address,rocalDB]);
  
  async function Insert_staff_db(account,pass,data){

    var sql = `select * from staff_mst where (account = '${account}' and password = '${pass}');`;
    var staff_mst = await db_select(sql);

    if (staff_mst == false) {
      var insert_staff = `insert into staff_mst values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
      await db_write(insert_staff,data);
    }
  
  }
  
  // サーバーからのデータを取得して、ローカルサーバーの中身を更新
  function getServerData(staff){

    fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: JSON.stringify({
        ID : staff.account,
        pass : staff.password
      })
    })
    .then((response) => response.json())
    .then(async(json) => {
      
      const staff = json.staff;
      
      // ログインデータ保持用
      global.sp_id = staff.account;
      
      // テーブルを空にする
      await db_write(`delete from staff_mst;`,[]);     // スタッフ
      
      // スタッフ情報をサーバーから取得
      const staff_data = [
        staff.account,
        staff.password,
        staff.shop_id,
        staff.name_1,
        staff.name_2,
        staff.name,
        staff.corporations_name,
        staff.setting_list,
        staff.app_token,
        staff.system_mail,
        staff.yahoomail,
        staff.gmail,
        staff.hotmail,
        staff.outlook,
        staff.softbank,
        staff.icloud,
        staff.original_mail,
        staff.line_id,
        staff.mail_name,
        staff.mail1,
        staff.mail2,
        staff.mail3,
        staff.top_staff_list,
        staff.setting_list7_mail,
      ];
      
      await Insert_staff_db(staff.account,staff.password,staff_data);

    })
    .catch((error) => {
      const errorMsg = "[※]自動ログインに失敗しました。";
      Alert.alert(errorMsg);
      console.log(error);
    })
    
  }
  
  // 駅・沿線データベース登録
  async function Insert_station_db(station){

    var sql = `select * from station_mst;`;
    var station_mst = await db_select(sql);

    if (station_mst == false) {
      var insert_station = `insert into station_mst values `;
      for (var s=0;s<station.length;s++) {
        insert_station += `('${station[s]["id"]}','${station[s]["name"]}'),`;
      }
      insert_station = insert_station.substring(0, insert_station.length-1); // 最後のコンマ消す
      await db_write(insert_station,[]);
    }

  }
  
  // エリアデータベース登録
  async function Insert_area_db(address){

    var sql = `select * from address_mst;`;
    var address_mst = await db_select(sql);

    if (address_mst == false) {
      var insert_address = `insert into address_mst values `;
      for (var a=0;a<address.length;a++) {
        insert_address += `('${address[a]["id"]}','${address[a]["name"]}'),`;
      }
      insert_address = insert_address.substring(0, insert_address.length-1); // 最後のコンマ消す
      await db_write(insert_address,[]);
    }
  }
  
  // ログイン
  function onSubmit(){
    
    setLoading(false);

    if (!id && !password) {
      Alert.alert('IDとパスワードを入力してください');
      return
    }
    if (!id) {
      Alert.alert('IDを入力してください');
      return
    } else if (!password) {
      Alert.alert('パスワードを入力してください');
      return
    }

    fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: JSON.stringify({
        ID : id,
        pass : password
      })
    })
    .then((response) => response.json())
    .then(async(json) => {
      
      // ログインデータ保持用
      global.sp_id = id;

      // トークン取得＆登録
      registerForPushNotificationsAsync();
      
      // websocket通信
      const WS_URL = 'ws://52.194.19.123:8080/ws/'+json.staff.shop_id+'/';
      
      const staff = json.staff;
      
      const staff_data = [
        staff.account,
        staff.password,
        staff.shop_id,
        staff.name_1,
        staff.name_2,
        staff.name,
        staff.corporations_name,
        staff.setting_list,
        staff.app_token,
        staff.system_mail,
        staff.yahoomail,
        staff.gmail,
        staff.hotmail,
        staff.outlook,
        staff.softbank,
        staff.icloud,
        staff.original_mail,
        staff.line_id,
        staff.mail_name,
        staff.mail1,
        staff.mail2,
        staff.mail3,
        staff.top_staff_list,
        staff.setting_list7_mail,
      ];
      
      await Insert_staff_db(staff.account,staff.password,staff_data);
      
      navigation.reset({
        index: 0,
        routes: [{
          name: 'CommunicationHistory',
          params: json.staff,
          websocket:new WebSocket(WS_URL),
          station:station,
          address:address,
          flg:'入力',
          previous:'LogIn'
        }],
      });
      
    })
    .catch((error) => {
      const errorMsg = "IDまたはパスワードが違います";
      Alert.alert(errorMsg);
      console.log(error);
    })
  };


// 20210826 端末トークン取得用(DBに端末情報保存)
async function registerForPushNotificationsAsync() {

  let token;
  
  if (Platform.OS === 'ios') {
    const { status } = await requestTrackingPermissionsAsync();
  }

  if (Device.isDevice) {

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        `プッシュ通知が無効になっています`,
        "設定画面へ移動しますか？",
        [
          {
            text: "キャンセル",
            style: "cancel",
            onPress:() => {return}
          },
          {
            text: "設定する",
            onPress: () => {
              Linking.openURL("app-settings:");
            }
          }
        ]
      );
      return;
    }
    
    // 【重要】端末別のトークン取得
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // グローバル変数にトークンを格納
    global.sp_token = token;
    
    // グローバル変数に、tokenとログインIDがある場合
    if(global.sp_token && global.sp_id){
      
      // サーバーに情報送信して、DBに書き込み
      await fetch(domain+'batch_app/set_staff_app_token_tup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: global.sp_id,
          token: global.sp_token
        }),
      })
      .catch((error) => {
        console.log('トークン登録失敗')
        console.log(error);
      })
    }

  } else {
    alert('この端末では、プッシュ通知が機能しません。');
  }

  setExpoPushToken(token);

  return token;
}

  return (
    <View style={styles.container}>
      <Loading isLoading={isLoading} />
      <View style={styles.inner}>
        <View style={styles.input}>
          <FloatingLabelInput
            label={"ID"}
            value={id}
            onChangeText={(text) => { setID(text); }}
            containerStyles={styles.inputInner}
            labelStyles={styles.inputLabel}
            inputStyles={{
              fontSize: 20,
            }}
          />
        </View>
        <View style={styles.input}>
          <FloatingLabelInput
            label={"パスワード"}
            value={password}
            isPassword
            customShowPasswordComponent={
              <Feather
                name='eye'
                size={20}
                color='#1f2d53'
              />
            }
            customHidePasswordComponent={
              <Feather
                name='eye-off'
                size={20}
                color='#1f2d53'
              />
            }
            onChangeText={(text) => { setPassword(text); }}
            containerStyles={styles.inputInner}
            labelStyles={styles.inputLabel}
            inputStyles={{
              fontSize: 20,
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={onSubmit}
        >
          <Text style={styles.buttonLabel}>ログイン</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
  },
  inner: {
    paddingHorizontal: 25,
    marginBottom: 25,
    marginTop: 50,
  },
  form: {
    width: "100%"
  },
  input: {
    marginBottom: 35,
  },
  inputInner: {
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical:15,
    backgroundColor: '#fff',
    borderColor: '#1f2d53',
    borderRadius: 8,
    fontSize:20,
  },
  buttonContainer: {
    backgroundColor: '#1f2d53',
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonLabel: {
    fontSize: 20,
    lineHeight: 32,
    paddingVertical: 8,
    paddingHorizontal: 32,
    color: '#ffffff',
  },
  errors: {
    color: 'red',
    marginBottom:5,
  },
});
