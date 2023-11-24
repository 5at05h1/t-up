import React, { useState,useEffect } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, BackHandler, AppState, ScrollView, FlatList, Platform, KeyboardAvoidingView
} from "react-native";
import RadioButtonRN from 'radio-buttons-react-native';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import GestureRecognizer from 'react-native-swipe-gestures';
import DropDownPicker from 'react-native-dropdown-picker';
import Modal from "react-native-modal";

import Loading from '../components/Loading';
import GetDB from '../components/Get_databace';

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("db");

// let domain = 'http://test.t-up.systems/';
let domain = 'https://www.t-up.systems/';

export default function Setting(props) {
  
  if (AppState.currentState === 'active') {
    Notifications.setBadgeCountAsync(0);
  }
  
  const { navigation, route } = props;
  
  const [isLoading, setLoading] = useState(false);
  
  // スタッフ情報
  const [staffs, setStaffs] = useState(route.params);
  
  // 名前
  const [name_1, setName_1] = useState(route.params.name_1);
  const [name_2, setName_2] = useState(route.params.name_2);

  // パスワード
  const [password, setPassword] = useState(route.params.password);
  const [password_modal, setPassword_modal] = useState(false);
  const [old_password, setOld_password] = useState(null);
  const [new_password1, setNew_password1] = useState(null);
  const [new_password2, setNew_password2] = useState(null);
  
  // メールの表示名
  const [mail_name, setMail_name] = useState(route.params.mail_name);
  
  // 個人メールアドレス
  const [mail1, setMail1] = useState(route.params.mail1);
  const [mail2, setMail2] = useState(route.params.mail2);
  const [mail3, setMail3] = useState(route.params.mail3);
  
  const [contact, setContact] = useState(null);
  
  const radio = [
    {
      label: 'メール',
      value: '',
    },
    {
      label: 'アプリ',
      value: '9_1'
    }
  ];
  
  if (route.params.line_id) {
    radio.push(
      {
        label: 'LINE',
        value: '9'
      }
    )
  }
  
  // 設定2
  const [setting_list1, setSetting_list1] = useState(false);
  const [setting_list1_staff, setSetting_list1_staff] = useState('');
  const [open_setting_list1_staff, setOpen_setting_list1_staff] = useState(false);
  
  const [setting_list2, setSetting_list2] = useState(false);
  const [setting_list2_staff, setSetting_list2_staff] = useState('');
  const [open_setting_list2_staff, setOpen_setting_list2_staff] = useState(false);
  
  const [setting_list3, setSetting_list3] = useState(false);
  
  const [top_staff_list, setTop_staff_list] = useState(route.params.top_staff_list);
  const [open_top_staff_list, setOpen_top_staff_list] = useState(false);
  
  const [setting_list5, setSetting_list5] = useState(false);
  
  const [setting_list6_select, setSetting_list6_select] = useState('');
  const [open_setting_list6_select, setOpen_setting_list6_select] = useState(false);
  const [setting_list6_staff, setSetting_list6_staff] = useState('');
  const [open_setting_list6_staff, setOpen_setting_list6_staff] = useState(false);
  
  const [setting_list6, setSetting_list6] = useState(false);
  
  const [setting_list7, setSetting_list7] = useState(false);
  const [setting_list7_mail, setSetting_list7_mail] = useState(route.params.setting_list7_mail);
  
  const [setting_list8, setSetting_list8] = useState(false);
  
  const DoNotDo = [
    {label:'する',value:'1'},
    {label:'しない',value:''},
  ]
  
  const whole_individual = [
    {label:'個人',value:''},
    {label:'全体',value:'1'},
  ]
  
  const list6 = [
    {label:'7:00',value:'2'},
    {label:'8:00',value:'1'},
    {label:'9:00',value:''},
  ]
  
  const cus_list = [
    {label:'担当するお客様',value:''},
    {label:'店全体のお客様',value:'_a'},
  ]
  
  // 端末の戻るボタン
  const backAction = () => {
    if (!isLoading) {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'CommunicationHistory',
          params: route.params,
          websocket:route.websocket,
          station:route.station,
          address:route.address,
          previous:'Setting'
        }],
      });
    }
    return true;
  };
  
  useEffect(() => {
    
    var setting_list = route.params.setting_list;
    
    if(setting_list){
      
      // 通知設定
      if (setting_list.split(',').includes('9')) {
        setContact('9');
      }
      if (setting_list.split(',').includes('9_1')) {
        setContact('9_1');
      }
      
      // 設定2-1
      if (setting_list.split(',').includes('1_a')) {
        setSetting_list1_staff('_a');
      }
      if (setting_list.split(',').includes('1') || setting_list.split(',').includes('1_a')) {
        setSetting_list1('1');
      }
      
      // 設定2-2
      if (setting_list.split(',').includes('2_a')) {
        setSetting_list2_staff('_a');
      }
      if (setting_list.split(',').includes('2') || setting_list.split(',').includes('2_a')) {
        setSetting_list2('1');
      }
      
      // 設定2-3
      if (setting_list.split(',').includes('3')) {
        setSetting_list3('1');
      }
      
      // 設定2-4
      if (route.params.top_staff_list) {
        setTop_staff_list('1');
      } else {
        setTop_staff_list('');
      }
      
      // 設定2-5
      if (setting_list.split(',').includes('5')) {
        setSetting_list5('1');
      }
      
      // 設定2-6(時間)
      
      var setting6_flg = ''; // 時間設定の為チェックフラグ
      
      if (setting_list.split(',').includes('6_2') || setting_list.split(',').includes('6_2_a')) {
        setSetting_list6_select('2');
        setting6_flg = '1';
      }
      if (setting_list.split(',').includes('6_1') || setting_list.split(',').includes('6_1_a')) {
        setSetting_list6_select('1');
        setting6_flg = '1';
      }
      if (setting_list.split(',').includes('6') || setting_list.split(',').includes('6_a')) {
        setSetting_list6_select('');
        setting6_flg = '1';
      }
      
      // 設定2-6
      if (setting6_flg) {
        setSetting_list6('1')
      }
      
      if (setting_list.split(',').includes('6') || setting_list.split(',').includes('6_1') || setting_list.split(',').includes('6_2') || !setting6_flg) {
        setSetting_list6_staff('')
      }
      if (setting_list.split(',').includes('6_a') || setting_list.split(',').includes('6_1_a') || setting_list.split(',').includes('6_2_a')) {
        setSetting_list6_staff('1')
      }
      
      // 設定2-7
      if (setting_list.split(',').includes('7')) {
        setSetting_list7('1')
      }
      
      // 設定2-8
      if (setting_list.split(',').includes('8')) {
        setSetting_list8('1')
      }
      
    }
    
    navigation.setOptions({
      headerLeft: () => (
        <Feather
          name='chevron-left'
          color='white'
          size={30}
          onPress={() => {
            if (!isLoading) {
              navigation.reset({
                index: 0,
                routes: [{
                  name: 'CommunicationHistory',
                  params: route.params,
                  websocket:route.websocket,
                  station:route.station,
                  address:route.address,
                  previous:'Setting'
                }],
              });
            }
          }}
          style={{paddingHorizontal:20,paddingVertical:20}}
        />
      ),
      headerRight: () => (
        <Feather
          name='log-out'
          color='white'
          size={30}
          onPress={() => logout()}
          style={{paddingHorizontal:20,paddingVertical:20}}
        />
      ),
    });

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  
function Delete_staff_db(){
  
  new Promise((resolve, reject)=>{
    db.transaction((tx) => {
    
      // スタッフ
      tx.executeSql(
        `delete from staff_mst;`,
        [],
        () => {console.log("delete staff_mst OK");},
        () => {console.log("delete staff_mst 失敗");}
      );
      // スタッフ一覧
      tx.executeSql(
        `delete from staff_list;`,
        [],
        () => {console.log("staff_list 削除");},
        () => {console.log("失敗");}
      );
      // お客様
      tx.executeSql(
        `delete from customer_mst;`,
        [],
        () => {console.log("customer_mst 削除");},
        () => {console.log("失敗");}
      );
      // コミュニケーション履歴
      tx.executeSql(
        `delete from communication_mst;`,
        [],
        () => {console.log("communication_mst 削除");},
        () => {console.log("失敗");}
      );
      // 定型文
      tx.executeSql(
        `delete from fixed_mst;`,
        [],
        () => {console.log("fixed_mst 削除");},
        () => {console.log("失敗");}
      );
    
    // →→→ 駅・沿線、エリアは残す
    
      resolve();
    })
    
  });

}
  
  function logout() {
    Alert.alert(
      "ログアウトしますか？",
      "",
      [
        {
          text: "はい",
          onPress: () => {
            
            Delete_staff_db();
            route.websocket.close()
            
            if(global.sp_token && global.sp_id){
              
              // サーバーに情報送信して、DBから削除
              fetch(domain+'batch_app/set_staff_app_token_tup.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: global.sp_id,
                  token: global.sp_token,
                  del_flg:1,
                }),
              })
              
            }
            
            global.sp_token = ''; // スマホトークン
            global.sp_id = '';    // ログインID
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'LogIn' }],
            });
          }
        },
        {
          text: "いいえ",
        },
      ]
    );
  
  }
  
  const [mail_check,setMail_check] = useState(null);
  
  function  onSubmit() {
  
    // ローディング開始
    setLoading(true);
    
    // setting_list形成
    var setting_list = '';
    
    // オプション1
    if (setting_list1) {
      if (setting_list) {
        setting_list += ',' + '1';
      } else {
        setting_list += '1';
      }
      setting_list += setting_list1_staff;
    }
    
    // オプション2
    if (setting_list2) {
      if (setting_list) {
        setting_list += ',' + '2';
      } else {
        setting_list += '2';
      }
      setting_list += setting_list2_staff;
    }
    
    // オプション3
    if (setting_list3) {
      if (setting_list) {
        setting_list += ',' + '3';
      } else {
        setting_list += '3';
      }
    }
    
    // オプション5
    if (setting_list5) {
      if (setting_list) {
        setting_list += ',' + '5';
      } else {
        setting_list += '5';
      }
    }
    
    // オプション6
    if (setting_list6) {
      if (setting_list) {
        if (setting_list6_select) {
          setting_list += ','+'6'+'_'+setting_list6_select;
        } else {
          setting_list += ','+'6';
        }
      } else {
        if (setting_list6_select) {
          setting_list += '6'+'_'+setting_list6_select;
        } else {
          setting_list += '6';
        }
      }
      setting_list += setting_list6_staff?'_a':'';
    }
    
    // オプション7
    if (setting_list7) {
      if (setting_list) {
        setting_list += ',' + '7';
      } else {
        setting_list += '7';
      }
    }
    
    // オプション8
    if (setting_list5) {
      if (setting_list) {
        setting_list += ',' + '8';
      } else {
        setting_list += '8';
      }
    }
    
    // オプション9(通知設定)
    if (contact) {
      if (setting_list) {
        setting_list += ',' + contact;
      } else {
        setting_list += contact;
      }
    }
    
    let formData = new FormData();
    formData.append('ID',route.params.account);
    formData.append('pass',route.params.password);
    formData.append('act','user_setting');
    formData.append('formdata_flg',1);
    formData.append('setting_flg',1);
    formData.append('mail_name',mail_name);
    formData.append('mail1',mail1?mail1:'');
    formData.append('mail2',mail2?mail2:'');
    formData.append('mail3',mail3?mail3:'');
    formData.append('setting_list',setting_list);
    formData.append('top_staff_list',top_staff_list);
    formData.append('setting_list7_mail',setting_list7_mail?setting_list7_mail:'');
  
    // PHP側でドットがアンスコに変換されてしまうのでフォームで送信
    fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
    {
      method: 'POST',
      header: {
        'content-type': 'multipart/form-data',
      },
      body: formData
    })
    .then((response) => response.json())
    .then((json) => {
      
      console.log(json)
      
      // アドレスかぶりチェック
      if (json == 'mail_check') {
        // ローディング終了
        setLoading(false);
        Alert.alert('','個人メールアドレスにお客様のメールアドレスが使われています\n 別のメールアドレスを使用してください');
      } else {
        
        // ローカルDB変更
        db.transaction((tx) => {
          tx.executeSql(
            'update staff_mst set mail_name = (?), setting_list = (?), top_staff_list = (?), setting_list7_mail = (?) where (account = ? and password = ?);',
            [mail_name,setting_list,top_staff_list,setting_list7_mail,staffs.account,staffs.password],
            // 変更成功
            (_, { rows }) => {
              tx.executeSql(
                `select * from staff_mst;`,
                [],
                (_, { rows }) => {
                  route.params = rows._array[0];
                  console.log(rows._array);
                },
                () => {
                  console.log("失敗");
                }
              );
              console.log('変更しました');
            },
            () => {
              // 変更失敗
              console.log('変更できなかったよ')
            }
          );
        });
        
        // ローディング終了
        setLoading(false);
        Alert.alert('設定を変更しました');
      }
      
    })
    .catch((error) => {
      // ローディング終了
      setLoading(false);
      console.log(error)
      const errorMsg = "設定の変更に失敗しました";
      Alert.alert(errorMsg);
    })
    
  };
  
  
  // パスワードのモーダルを閉じる
  function passwordClose() {
    
    setOld_password(null);
    setNew_password1(null);
    setNew_password2(null);
    setPassword_modal(false);
    
  }

  // パスワード変更
  function passwordSubmit() {
    
    // ローディング開始
    setLoading(true);
    
    var err = ''
    
    if (password != old_password) {
      err += '\n・元のパスワードが間違っています';
    }
    
    if (new_password1 !== new_password2) {
      err += '\n・新しいパスワードと再入力パスワードが違います';
    }
    
    if(new_password1 && new_password1.length >= 6) {
      ;
    } else {
      err += '\n・パスワードは6文字以上入力してください';
    }
    
    if (err) {
      // ローディング終了
      setLoading(false);
      Alert.alert('以下のエラーが出ました',err);
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
          ID : route.params.account,
          pass : route.params.password,
          act:'user_setting',
          password:new_password1,
        })
      })
      .then((response) => response.json())
      .then((json) => {
        
        setPassword(new_password1);
        
        // ローカルDB変更
        db.transaction((tx) => {
          tx.executeSql(
            'update staff_mst set password = (?) where (account = ? and password = ?);',
            [new_password1,staffs.account,staffs.password],
            // 変更成功
            (_, { rows }) => {
              tx.executeSql(
                `select * from staff_mst;`,
                [],
                (_, { rows }) => {
                  route.params = rows._array[0];
                  // console.log(rows._array[0])
                },
                () => {
                  console.log("失敗");
                }
              );
              console.log('変更しました');
            },
            () => {
              // 変更失敗
              console.log('変更できなかったよ')
            }
          );
      
        });
        
        // ローディング終了
        setLoading(false);
        Alert.alert('パスワードを変更しました');
        passwordClose()
      })
      .catch((error) => {
        // ローディング終了
        setLoading(false);
        const errorMsg = "パスワードの変更に失敗しました";
        Alert.alert(errorMsg);
        passwordClose()
      })
      
  }
  
  return (
    
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 70}
      style={{ flex: 1 }}
    >
      <Loading isLoading={isLoading} />
      {/* <ScrollView contentContainerStyle={styles.form}> */}
      <FlatList
        style={styles.form}
        data={[(
        <GestureRecognizer
          onSwipeRight={()=>{backAction()}}
          style={{flex: 1}}
        >
          <Text style={styles.title}>個人ID 設定1</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.input}>
              <Text style={styles.label}>氏名(姓)</Text>
              <TextInput
                value={name_1}
                onChangeText={(text) => {setName_1(text)}}
                style={styles.inputInner}
                editable={false}
              />
            </View>
            <View style={styles.input}>
              <Text style={styles.label}>氏名(名)</Text>
              <TextInput
                value={name_2}
                onChangeText={(text) => {setName_2(text)}}
                style={styles.inputInner}
                editable={false}
              />
            </View>
          </View>
          
          <View style={{flexDirection:'row'}}>
            <Text style={styles.label}>パスワード</Text>
            <View style={styles.btn_wrap}>
              <TouchableOpacity onPress={() => {setPassword_modal(true)}} style={styles.btn}>
                <Text style={styles.btn_text}>変　更</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            value={password}
            onChangeText={(text) => {setPassword(text)}}
            style={styles.inputInner}
            editable={false}
            secureTextEntry={true}
          />
          <Modal
            isVisible={password_modal}
            onBackdropPress={() => {passwordClose()}}
            swipeDirection={['up']}
            onSwipeComplete={() => {passwordClose()}}
            backdropOpacity={0.5}
            animationInTiming={300}
            animationOutTiming={500}
            animationIn={'slideInDown'}
            animationOut={'slideOutUp'}
            propagateSwipe={true}
            style={{alignItems: 'center'}}
          >
            <KeyboardAvoidingView  style={styles.password_modal} behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top:8,
                  right:10,
                  zIndex:999
                }}
                onPress={() => {passwordClose()}}
              >
                <Feather name='x-circle' color='gray' size={35} />
              </TouchableOpacity>
              <Text>パスワードの条件：{"\n"}・英大文字と小文字を含む{"\n"}・数字を含む{"\n"}・８文字以上</Text>
              <Text style={styles.modal_label}>元のパスワード</Text>
              <TextInput
                value={old_password}
                onChangeText={(text) => {setOld_password(text)}}
                style={styles.inputInner}
                keyboardType={'email-address'}
              />
              <Text style={styles.modal_label}>新しいパスワード</Text>
              <TextInput
                value={new_password1}
                onChangeText={(text) => {setNew_password1(text)}}
                style={styles.inputInner}
                secureTextEntry={true}
              />
              <Text style={styles.modal_label}>【再入力】新しいパスワード</Text>
              <TextInput
                value={new_password2}
                onChangeText={(text) => {setNew_password2(text)}}
                style={styles.inputInner}
                secureTextEntry={true}
              />
              <TouchableOpacity
                onPress={passwordSubmit}
                style={styles.moddal_submit}
              >
                <Text style={styles.submitLabel}>変　更</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Modal>
          
          <Text style={[styles.label,{marginBottom:0}]}>メールの表示名</Text>
          <Text style={styles.label_text}>※お客様側でメールを受信したとき表示される送信元名です{"\n"}未設定の場合は店舗名が表示されます</Text>
          <TextInput
            value={mail_name}
            onChangeText={(text) => {setMail_name(text)}}
            style={styles.inputInner}
          />
          
          <Text style={styles.label}>個人メールアドレス1</Text>
          <TextInput
            value={mail1}
            onChangeText={(text) => {setMail1(text)}}
            style={styles.inputInner}
            keyboardType={'email-address'}
          />
          
          <Text style={styles.label}>個人メールアドレス2</Text>
          <TextInput
            value={mail2}
            onChangeText={(text) => {setMail2(text)}}
            style={styles.inputInner}
            keyboardType={'email-address'}
          />
          
          <Text style={styles.label}>個人メールアドレス3</Text>
          <TextInput
            value={mail3}
            onChangeText={(text) => {setMail3(text)}}
            style={styles.inputInner}
            keyboardType={'email-address'}
          />
          <Text style={styles.label}>通知方法</Text>
          <View >
            <RadioButtonRN
              data={radio}
              value={contact}
              selectedBtn={(e) => {setContact(e.value)}}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              initial={!contact?1:contact==='9_1'?2:contact==='9'?3:2}
            />
            
          </View>
          
          <Text style={styles.title}>個人ID 設定2</Text>
          
          <View style={[styles.setting2,{zIndex:999}]}>
            <View style={{width:'70%'}}>
              <View style={[{flexDirection:'row',zIndex:999,marginBottom:15}]}>
                <Text style={styles.label2}>1.</Text>
                <DropDownPicker
                  style={styles.dropDown}
                  containerStyle={{width:160}}
                  dropDownContainerStyle={styles.dropDownContainer}
                  open={open_setting_list1_staff}
                  value={setting_list1_staff}
                  items={cus_list}
                  setOpen={setOpen_setting_list1_staff}
                  setValue={setSetting_list1_staff}
                  zIndex={900}
                  dropDownDirection={'BOTTOM'}
                />
              </View>
              <Text style={styles.dropDownlabel}>からメールがあった時に、個人携帯に通知</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list1}
              selectedBtn={(e) => {
                setSetting_list1(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list1?1:2}
            />
          </View>
          
          <View style={[styles.setting2,{zIndex:998}]}>
            <View style={{width:'70%'}}>
              <View style={[{flexDirection:'row',zIndex:999,marginBottom:15}]}>
                <Text style={styles.label2}>2.</Text>
                <DropDownPicker
                  style={styles.dropDown}
                  containerStyle={{width:160}}
                  dropDownContainerStyle={styles.dropDownContainer}
                  open={open_setting_list2_staff}
                  value={setting_list2_staff}
                  items={cus_list}
                  setOpen={setOpen_setting_list2_staff}
                  setValue={setSetting_list2_staff}
                  zIndex={900}
                  dropDownDirection={'BOTTOM'}
                />
              </View>
              <Text style={styles.dropDownlabel}>が物件を閲覧したときに、個人携帯に通知</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list2}
              selectedBtn={(e) => {
                setSetting_list2(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list2?1:2}
            />
          </View>
          
          <View style={[styles.setting2]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>3.最初反響が入った時に、個人携帯に通知</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list3}
              selectedBtn={(e) => {
                setSetting_list3(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list3?1:2}
            />
          </View>
          
          <View style={[styles.setting2,Platform.OS === 'ios'?{zIndex:997}:{}]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>4.TOPページの表示の初期設定</Text>
            </View>
            <DropDownPicker
              style={[styles.dropDown,{width:100}]}
              containerStyle={{flex:1}}
              dropDownContainerStyle={[styles.dropDownContainer,{width:100}]}
              open={open_top_staff_list}
              value={top_staff_list}
              items={whole_individual}
              setOpen={setOpen_top_staff_list}
              setValue={setTop_staff_list}
              zIndex={900}
              dropDownDirection={'BOTTOM'}
            />
          </View>
          
          <View style={[styles.setting2]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>5.担当するお客様が設定リンク先を閲覧した時に、個人携帯に通知</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list5}
              selectedBtn={(e) => {
                setSetting_list5(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list5?1:2}
            />
          </View>
          
          <View style={[styles.setting2]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>6.AM9:00に本日の予定を個人携帯に通知</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list6}
              selectedBtn={(e) => {
                setSetting_list6(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list6?1:2}
            />
          </View>
          
          <View style={[styles.setting2]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>7.メールを送信する際、{"\n"}下記のメールアドレスにも送信</Text>
              <TextInput
                value={setting_list7_mail}
                onChangeText={(text) => {setSetting_list7_mail(text)}}
                style={[styles.inputInner,{margin:0,height:40}]}
              />
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list7}
              selectedBtn={(e) => {
                setSetting_list7(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list7?1:2}
            />
          </View>
          
          <View style={[styles.setting2]}>
            <View style={{width:'70%',alignSelf:'center'}}>
              <Text style={styles.dropDownlabel}>8.【TOPページ】同じお客様のスケジュールはまとめて表示</Text>
            </View>
            <RadioButtonRN
              data={DoNotDo}
              value={setting_list8}
              selectedBtn={(e) => {
                setSetting_list8(e.value);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              box={true}
              boxStyle={styles.radio_box}
              textStyle={{marginLeft:10,fontSize:16}}
              style={{flex:1}}
              initial={setting_list8?1:2}
            />
          </View>
          
          <TouchableOpacity
            onPress={onSubmit}
            style={styles.submit}
          >
            <Text style={styles.submitLabel}>確　定</Text>
          </TouchableOpacity>
        </GestureRecognizer>
        )]}
        renderItem={({ item }) => (
          <>{item}</>
        )}
      />
      {/* </ScrollView> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "90%",
    alignSelf:'center'
  },
  title: {
    fontSize:20,
    color:'#1d449a',
    fontWeight:'bold',
    marginTop: 20,
  },
  setting2:{
    flexDirection:'row',
    marginTop: 20
  },
  label: {
    marginTop: 20,
    marginBottom:10,
    marginLeft:5,
    fontSize:16,
  },
  label2: {
    alignSelf:'center',
    marginRight:10,
    marginLeft:5,
    fontSize:16,
  },
  label_text: {
    fontSize:12,
    color:'#999999',
    marginBottom:5,
  },
  input: {
    marginBottom: 10,
    width:'50%',
  },
  inputInner: {
    marginHorizontal:5,
    padding:10,
    backgroundColor: '#fff',
    borderColor: '#1f2d53',
    fontSize:16,
    borderWidth: 1.5,
    borderRadius: 8,
    color:'#000000'
  },
  radioLabel: {
    fontSize: 16,
  },
  error: {
    color: 'red'
  },
  submit: {
    marginTop:30,
    marginBottom:50,
    backgroundColor: '#1f2d53',
    borderRadius: 8,
    alignSelf: 'center',
  },
  submitLabel: {
    fontSize: 20,
    lineHeight: 32,
    paddingVertical: 8,
    paddingHorizontal: 32,
    color: '#ffffff',
  },
  btn_wrap: {
    flexDirection:'row',
    marginLeft: 'auto'
  },
  btn:{
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    width:80,
    height:35,
    backgroundColor:'#1f2d53',
  },
  btn_text: {
    color:'#ffffff'
  },
  radio_box: {
    height:40,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingLeft:20,
    marginTop: 0,
    marginBottom:5,
    marginLeft:0
  },
  dropDown: {
    height:40,
    width:160,
    backgroundColor: '#fff',
    borderColor: '#191970',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  dropDownContainer: {
    width:160,
    borderColor: '#191970',
    borderWidth: 1.5,
    zIndex:998,
  },
  dropDownlabel: {
    color:'#000',
    fontSize:16,
  },
  password_modal: {
    backgroundColor: "#ffffff",
    width:'90%',
    padding:15,
  },
  modal_label: {
    marginTop: 10,
    marginBottom:5,
    marginLeft:5,
    fontSize:16,
  },
  moddal_submit: {
    marginVertical:20,
    backgroundColor: '#47a9ce',
    borderRadius: 8,
    alignSelf: 'center',
  },
});
