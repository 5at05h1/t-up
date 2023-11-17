import React, { useState, useEffect, useRef } from 'react';
import {
   View, Text, StyleSheet, TouchableOpacity, Alert,TextInput,Platform ,AppState,Linking,LogBox
} from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import VersionCheck from 'react-native-version-check-expo'

LogBox.ignoreLogs([
"exported from 'deprecated-react-native-prop-types'.",
])

// oishi 端末token取得用追加
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import Loading from '../components/Loading';
import * as SQLite from "expo-sqlite";
import CreateDB from '../components/Databace';
import GetDB from '../components/Get_databace';

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
  
  // アプリの最新バージョンを取得する実装
  const latestAppVersion = '2.2.8';
  
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
  
  const[ExpoPushToken,setExpoPushToken] = useState(false);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  useEffect(() => {
    
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    
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
    
    // 新しいバージョンのアプリがストアに配布されている場合は更新を促す
    if (appVersion != latestAppVersion) {
      
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
    
    // ローカルDBでログイン(同期処理)
    const execute = async() => {
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
        await GetDB(station,'station_mst');
        
        if (station.length == 0) {
          toast('データベース更新中\n少々お待ちください');
          fetch(domain+'js/data/reins.json')
          .then((response) => response.json())
          .then((json) => {
            Insert_station_db(json);
          })
          .catch((error) => {
            const errorMsg = "失敗駅・沿線";
            Alert.alert(errorMsg);
          })
        }
      }
      
      // エリア
      const set_area = async() => {
        
        await GetDB(address,'address_mst');
        if (address.length == 0) {
          
          fetch(domain+'js/data/address.json')
          .then((response) => response.json())
          .then((json) => {
            Insert_area_db(json)
          })
          .catch((error) => {
            const errorMsg = "失敗エリア";
            Alert.alert(errorMsg);
          })
        }
      }
      
      await CreateDB();
      await set_station();
      await set_area();
      Toast.hide(toast);
      await GetDB(rocalDB,'staff_mst');
      
      
    }
    execute();
    
  }, []);
  
  // 取得したトークンで自動ログイン
  useEffect(() => {
    
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
    } else if (rocalDB.length == 0) {
      fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // PHPに送るデータ
        body: JSON.stringify({
          sp_token : ExpoPushToken,
        })
      })
        .then((response) => response.json())
        .then((json) => {
          
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
            
          Insert_staff_db(staff.account,staff.password,staff_data);
          
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
    }
    
      
  }, [station,address]);
  
  function Insert_staff_db(account,pass,data){
    db.transaction((tx) => {
      
      tx.executeSql(
        `select * from staff_mst where (account = ? and password = ?);`,
        [account,pass],
        (_, { rows }) => {

          if (!rows._array.length) {
            tx.executeSql(
              `insert into staff_mst values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
              data,
              () => {console.log("insert staff_mst");},
              () => {console.log("staff_mst 失敗");}
            );
          } else {
            // console.log("localDB staff OK");
          }
        },
        () => {console.log("失敗");}
      );
      
    });
  
  }
  
  // テーブルを空にする
  function delete_db(){
      
    new Promise((resolve, reject)=>{
      db.transaction((tx) => {
        // スタッフ
        tx.executeSql(
          `delete from staff_mst;`,
          [],
          () => {console.log("staff_mst [delete]テーブル削除");},
          () => {console.log("staff_mst [delete]テーブル削除失敗");}
        );
        resolve();
      })
    });
  }
  
  // サーバーからのデータを取得して、ローカルサーバーの中身を更新
  function getServerData(staff){
    // 
    fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // PHPに送るデータ
      body: JSON.stringify({
        ID : staff.account,
        pass : staff.password
      })
    })
      .then((response) => response.json())
      .then((json) => {
        
        const staff = json.staff;
        
        // ログインデータ保持用
        global.sp_id = staff.account;
        
        // テーブルの中身を空にする
        delete_db();
          
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
          
        Insert_staff_db(staff.account,staff.password,staff_data);

      })
      .catch((error) => {
        const errorMsg = "[※]自動ログインに失敗しました。";
        Alert.alert(errorMsg);
        console.log(error)
      })
    
  }
  
  // 駅・沿線データベース登録
  function Insert_station_db(station){
    return new Promise((resolve, reject)=>{
      db.transaction((tx) => {
        
        tx.executeSql(
          `select * from station_mst;`,
          [],
          (_, { rows }) => {
            
            setLoading(true)
            if (!rows._array.length) {
              
              db.transaction((tx) => {
                Promise.all(station.map((s) => {
                  tx.executeSql(
                    `insert into station_mst values (?,?);`,
                    [s.id,s.name],
                    () => {
                      // console.log("insert station_mst");
                    },
                    () => {console.log("station_mst 失敗");}
                  );
                })).then(() => {
                  tx.executeSql(
                    `select * from station_mst;`,
                    [],
                    (_, { rows }) => {setStation(rows._array);}
                  );
                });
              })
                
            }
            
            if (rows._array.length) {
              setStation(rows._array);
            }
          },
          () => {console.log("失敗b");}
        );
        
      });
      resolve();
    });
  }
  
  // エリアデータベース登録
  function Insert_area_db(address){
    return new Promise((resolve, reject)=>{
      db.transaction((tx) => {
        tx.executeSql(
          `select * from address_mst;`,
          [],
          (_, { rows }) => {
            setLoading(true)
            if (!rows._array.length) {
              
              db.transaction((tx) => {
                Promise.all(address.map((a) => {
                  tx.executeSql(
                    `insert into address_mst values (?,?);`,
                    [a.id,a.name],
                    () => {
                      // console.log("insert address_mst");
                    },
                    () => {console.log("address_mst 失敗");}
                  );
                })).then(() => {
                  tx.executeSql(
                    `select * from address_mst;`,
                    [],
                    (_, { rows }) => {setAddress(rows._array);}
                  );
                  setLoading(false)
                });
              })
            }
            
            if (rows._array.length) {
              setAddress(rows._array);
              resolve(setLoading(false));
              
            }
          },
          () => {console.log("失敗");}
        );
        
      });
      resolve();
    });
  }
  
  // ログイン
  function onSubmit(){
    
    setLoading(false);
    fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // PHPに送るデータ
      body: JSON.stringify({
        ID : id,
        pass : password
      })
    })
      .then((response) => response.json())
      .then((json) => {
        
        // ログインデータ保持用
        global.sp_id = id;

        // トークン取得＆登録
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        
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
          
        Insert_staff_db(staff.account,staff.password,staff_data);
        
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
        console.log(error)
      })
  };


// 20210826 端末トークン取得用(DBに端末情報保存)
async function registerForPushNotificationsAsync() {
  let token;
  let experienceId = undefined;
  
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('この端末では、プッシュ通知が機能しません。');
      return;
    }
    
    // 【重要】端末別のトークン取得
    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // グローバル変数にトークンを格納
    global.sp_token = token;
    
    // トークン保存
    //alert("check1");
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
    }

  }
  else {
    alert('この端末では、プッシュ通知が機能しません。');
  }

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
