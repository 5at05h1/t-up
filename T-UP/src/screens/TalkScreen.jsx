import React, { useState,useEffect } from 'react';
import {
  Platform, StyleSheet, View, Text, Alert, Keyboard, TouchableOpacity, TextInput, Linking, LogBox, BackHandler, AppState
} from 'react-native';
import { GiftedChat, Actions, Send, InputToolbar, Bubble, Time, Message, Composer } from 'react-native-gifted-chat';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import * as Permissions from "expo-permissions";
import GestureRecognizer from 'react-native-swipe-gestures';

import Loading from '../components/Loading';
import {MyModal0,MyModal1,MyModal2,MyModal3,MyModal4,MyModal5,MyModal6} from '../components/Modal';

import * as SQLite from "expo-sqlite";

// DB接続
const db = SQLite.openDatabase("db");

import axios from 'axios';

LogBox.ignoreAllLogs()
// let domain = 'http://test.t-up.systems/';
let domain = 'https://www.t-up.systems/';

export default function TalkScreen(props) {
  
  if (AppState.currentState === 'active') {
    Notifications.setBadgeCountAsync(0);
  }
  
  const { navigation, route } = props;
  
  const [isLoading, setLoading] = useState(false);
  
  const [talk, setTalk] = useState([]);

  const [messages, setMessages] = useState([]);
  const [customer, setCustomer] = useState(false);
  const [staff, setStaff] = useState([]);
  const [options, setOptions] = useState(false);
  const [overlap, setOverlap] = useState(false);
  
  const [menu, setMenu] = useState(false);
  const [modal0, setModal0] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [modal3, setModal3] = useState(false);
  const [modal4, setModal4] = useState(false);
  const [modal5, setModal5] = useState(false);
  const [modal6, setModal6] = useState(false);
  
  const [reservation,setReservation] = useState([]);
  const [mail, setMail] = useState([]);
  const [msgtext,setMsgtext] = useState('');
  const [subject,setSubject] = useState('');
  
  const [add, setAdd] = useState([]);
  
  const [property,setProperty] = useState(false);
  const [conditions_date,setConditions_date] = useState(false);
  const [chatbot,setChatbot] = useState(false);
  const [inquiry,setInquiry] = useState(false);
  const [inquiry_text,setInquiry_text] = useState(false);
  
  const [tantou,setTantou] = useState(false);
  
  // 端末の戻るボタン
  const backAction = () => {
    if (!isLoading) {
      if(msgtext) {
        Alert.alert(
          "入力されたテキストは消えますが\nよろしいですか？",
          "",
          [
            {
              text: "はい",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: 'CommunicationHistory' ,
                    params: route.params,
                    websocket:route.websocket,
                    station:route.station,
                    address:route.address,
                    previous:'TalkScreen'
                  }],
                });
              }
            },
            {
              text: "いいえ",
            },
          ]
        );
      } else {
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory' ,
            params: route.params,
            websocket:route.websocket,
            station:route.station,
            address:route.address,
            previous:'TalkScreen'
          }],
        });
      }
    }
    return true;
  };
    
  useEffect(() => {
    
    navigation.setOptions({
      headerTitle:() => (<Text style={styles.name}>{route.cus_name}</Text>),
      headerTitleAlign: 'left',
      headerLeft: () => (
        <Feather
          name='chevron-left'
          color='white'
          size={30}
          onPress={() => {
            if (!isLoading) {
              if(msgtext) {
                Alert.alert(
                  "入力されたテキストは消えますが\nよろしいですか？",
                  "",
                  [
                    {
                      text: "はい",
                      onPress: () => {
                        navigation.reset({
                          index: 0,
                          routes: [{
                            name: 'CommunicationHistory' ,
                            params: route.params,
                            websocket:route.websocket,
                            station:route.station,
                            address:route.address,
                            previous:'TalkScreen'
                          }],
                        });
                      }
                    },
                    {
                      text: "いいえ",
                    },
                  ]
                );
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: 'CommunicationHistory' ,
                    params: route.params,
                    websocket:route.websocket,
                    station:route.station,
                    address:route.address,
                    previous:'TalkScreen'
                  }],
                });
              }
            }
          }}
          style={{paddingHorizontal:20,paddingVertical:20}}
        />
      ),
    });

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [msgtext,isLoading])
  
  useEffect(() => {
    
    setLoading(true);
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
        act:'get_talk',
        customer_id:route.customer,
      })
    })
      .then((response) => response.json())
      .then((json) => {
        setTalk(json['communication']);
        setCustomer(json['customer_data']);
        setStaff(json['staff']);
        setReservation(json['customer_reservation']);
        setProperty(json['article_list']);
        setConditions_date(json['conditions_date']);
        setChatbot(json['chatbot_array']);
        setInquiry(json['inquiry']);
        setOptions(json['staff'].option_list.includes('14'));
        setOverlap(json['overlap']);
        setLoading(false);
        
        // 登録用に一つ一つ配列化
        const communication_mst = [];
        
        // ローカルDB用コミュニケーション履歴
        const t = json['communication'];

        for (let i = 0; i < 20; i++) {
          
          if (!t[i]) {
            break
          }
          
          communication_mst.unshift({
            communication_id: t[i].communication_id,
            customer_id: t[i].customer_id,
            speaker: t[i].speaker,
            time: t[i].time,
            title: t[i].title,
            note: t[i].note,
            line_note: t[i].line_note,
            file_path: t[i].file_path,
            status: t[i].status,
            del_flg:t[i].del_flg,
            html_flg:t[i].html_flg
          });
          
        }
        
        Insert_communication_db(communication_mst)
        
      })
      .catch((error) => {
        setLoading(false);
        
        db.transaction((tx) => {
          tx.executeSql(
            `select * from communication_mst where ( customer_id = ? ) order by time desc;`,
            // `delete from communication_mst;`,
            [route.customer],
            (_, { rows }) => {
              setTalk(rows._array)
              const talk_count = rows._array.length;
              
              const errTitle = 'ネットワークの接続に失敗しました';
              const errMsg = '直近の'+talk_count+'件のメッセージのみ表示します\n※送受信やおすすめ物件、画像の表示などはできません'
              Alert.alert(errTitle,errMsg);
              
            },
            () => {
              console.log("失敗");
            }
          );
          
        });
        
      })
  
  }, [])
  
  // 更新
  const [refreshing, setRefreshing] = useState(false);
  
  // websocket通信(繋がった)
  route.websocket.onopen = (open) => {
    console.log('open');
  };
  
  // websocket通信(メール届いたら更新)
  route.websocket.onmessage = (message) => {
    let catchmail_flg = JSON.parse( message.data );
    console.log(catchmail_flg.message)
    
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
        act:'get_talk',
        customer_id:route.customer,
      })
    })
      .then((response) => response.json())
      .then((json) => {
        setTalk(json['communication']);
        setCustomer(json['customer_data']);
        setStaff(json['staff']);
        setReservation(json['customer_reservation']);
        setProperty(json['article_list']);
        setConditions_date(json['conditions_date']);
        setChatbot(json['chatbot_array']);
        setInquiry(json['inquiry']);
        setOptions(json['staff'].option_list.includes('14'));
      })
      .catch((error) => {
        const errorMsg = "更新に失敗しました";
        Alert.alert(errorMsg);
      })
  }
  
  // websocket通信(切断したら再接続)
  route.websocket.onclose = (close) => {
    
    if (global.sp_token & global.sp_id) {
      console.log('closed');
      const WS_URL = 'ws://52.194.19.123:8080/ws/'+route.params.shop_id+'/'
      navigation.reset({
        index: 0,
        routes: [{
          name: 'TalkScreen' ,
          params: route.params ,
          customer:route.customer,
          websocket:new WebSocket(WS_URL),
          station:route.station,
          address:route.address,
        }],
      });
    }
    
  }
  
  useEffect(() => {
    
    // 重複まとめ
    if (overlap) {
      if(overlap.overlap == '1' || overlap.overlap == '2' || overlap.overlap == '3') {
        
        if (customer) {
          setModal6(true);
        }
      }
    }
    
  }, [overlap])
  
  useEffect(() => {
    // 担当者割り振り
    if (customer) {
      
      // 反響・来店ともに担当者無し→反響担当者
      if (!customer.reverberation.user_id && customer.main.status == '未対応') {
        setTantou('反響');
        setModal5(true);
      }
      
      // // 来店日入っているのに担当がいないとき→来店担当者
      // else if (!customer.coming.user_id && customer.coming.coming_day1) {
      //   setTantou('来店');
      //   setModal5(true);
      // }
      
      navigation.setOptions({
        headerRight: () => (
          <Feather
            name='phone'
            color='white'
            size={30}
            onPress={() => {
              if (!isLoading) {
                const phoneNumber = `tel:${customer.main.tel1}`;
                Linking.openURL(phoneNumber);
              }
            }}
            style={!customer.main.tel1?{display:'none'}:{paddingHorizontal:15,paddingVertical:10}}
          />
        ),
      });
      
    }
  }, [customer])
  
  useEffect(() => {
    if(inquiry) {
      var inquiry_data = inquiry.map(i => {
      const i_data = i.article_name+' '+i.room_no+"\n"+i.address+"\n"+i.line_name1+' '+i.station_name1+' '+(i.station_how_to1 == "徒歩"?i.station_how_to1+i.station_time1:i.station_how_to1 == "バス"?i.station_how_to1+i.bus_time1:'')+"分\n"+"賃料："+i.rent/10000+"万円\n"+"間取り："+i.layout+"\n"+"https://www.t-up.systems/show/"+route.customer+"/1/"+i.article_id+"\n";
        return i_data;
      })
      setInquiry_text(inquiry_data)
    }
    
  }, [inquiry])
  
  useEffect(() => {
    
    const msg = talk.map(com => {
      
      if (com.del_flg){
        return
      }
      
      if (com.speaker === 'お客様') {
        const data = {
          _id:  com.communication_id,
          text: com.note+(com.line_note && com.title !== 'スタンプ'?com.line_note:''),
          image:com.file_path?com.file_path:com.title === 'スタンプ'?'https://stickershop.line-scdn.net/stickershop/v1/sticker/'+com.line_note+'/iphone/sticker@2x.png':''
          ,
          createdAt: com.time,
          user: {
            _id: 2,
            name: com.speaker,
            avatar:null,
            status:com.status,
            title:com.title,
            html_flg:com.html_flg,
          }
        }
        return data;
      }else if (com.speaker === '店舗') {
        const data = {
          _id:  com.communication_id,
          text: com.note+(com.line_note?com.line_note:''),
          image:com.file_path?com.file_path:'',
          createdAt: com.time,
          user: {
            _id: 1,
            name: com.speaker,
            avatar:null,
            status:com.status,
            title:com.title,
            html_flg:com.html_flg,
          }
        }
        return data;
      }
    }).filter(data => data);
    setMessages(msg);
  }, [talk])
  
  const renderBubble = props => {
    
    const message_sender_id = props.currentMessage.user._id;
    const image = props.currentMessage.image;
    const stamp = props.currentMessage.user.title;
    
    return (
      <Bubble
        {...props}
        position={message_sender_id == 2 ? 'left' : 'right'}
        textStyle={{
          right: {
            fontSize: 12,
          },
          left: {
            fontSize: 12
          },
        }}
        wrapperStyle={{
            right: {
              backgroundColor: 'white',
              borderWidth: 2,
              borderColor: '#1f2d53',
              marginRight: 5,
              marginVertical: 5,
              maxWidth: '75%',
            },
            left: {
              backgroundColor: (stamp==='スタンプ'||image!==''?'transparent':'#1f2d53'),
              marginLeft: 5,
              marginVertical: 5,
              borderBottomLeftRadius: 1,
              maxWidth: '75%',
            },
        }}
      />
    );
    
  };
  
  // コミュニケーション履歴データベース登録
  function Insert_communication_db(communication){
    
    db.transaction((tx) => {
      
      tx.executeSql(
        `select * from communication_mst where (customer_id = ?);`,
        [communication[0].customer_id],
        (_, { rows }) => {
          
          const rocal = rows._array;
          
          if (!rows._array.length) {
            
            db.transaction((tx) => {
              communication.map((c) => {
                
                if (!c.del_flg) {
                  tx.executeSql(
                    `insert into communication_mst values (?,?,?,?,?,?,?,?,?,?);`,
                    [c.communication_id,c.customer_id,c.speaker,c.time,c.title,c.note,c.line_note,c.file_path,c.status,c.html_flg],
                    () => {
                      // console.log("insert staff_list");
                    },
                    () => {console.log("staff_list 失敗");}
                  );
                }
                
              });
            })
            
          }
          
          // del_flgデータ削除 + 新しいコミュニケーション履歴追加
          if (rows._array.length) {
            
            db.transaction((tx) => {
              
              communication.map((c) => {
                
                rocal.map((r) => {
                  if (c.del_flg) {
                    if (c.communication_id === r.communication_id && c.customer_id === r.customer_id) {
                      db.transaction((tx) => {
                        // del_flg消す
                        tx.executeSql(
                          `delete from communication_mst where (communication_id = ? and customer_id = ?);`,
                          [r.communication_id,r.customer_id],
                          (_, { rows }) => {
                            // console.log(r.communication_id)
                            console.log('del_flgデータを削除したよ');
                          },
                          () => {
                            console.log("失敗");
                          }
                        );
                      })
                    }
                    
                  }
                })
              });
              
              // 追加
              const local_communication_list = rocal.map((r) => {
                return (r.communication_id);
              });
              
              const server_communication_list = communication.map((c) => {
                return (c.communication_id);
              });
              
              const add_communication_list = server_communication_list.filter(c => local_communication_list.indexOf(c) == -1)
              
              // 最大20件に制御するため古いものを削除する
              if (rocal.length > 20){
                tx.executeSql(
                  `delete from communication_mst where (communication_id = ? and customer_id = ?);`,
                  [rocal[0].communication_id,rocal[0].customer_id],
                  (_, { rows }) => {
                    // console.log(r.communication_id)
                    console.log('古いデータを削除したよ');
                  },
                  () => {
                    console.log("失敗");
                  }
                );
              }
              
              communication.map((c) => {
                add_communication_list.map((add) => {
                  
                  if (c.communication_id === add && !c.del_flg) {
                    db.transaction((tx) => {
                      
                      tx.executeSql(
                        `insert into communication_mst values (?,?,?,?,?,?,?,?,?,?);`,
                        [c.communication_id,c.customer_id,c.speaker,c.time,c.title,c.note,c.line_note,c.file_path,c.status,c.html_flg],
                        () => {
                          console.log(c.communication_id)
                          console.log("新しいコミュニケーションを追加したよ");
                        },
                        () => {
                          console.log("新しいコミュニケーションのデータ追加 失敗");
                        }
                      );
                      
                    })
                  }
                  
                })
              })
              
            })
            
          }
        },
        () => {console.log("失敗");}
      );
      
      tx.executeSql(
        `select * from communication_mst order by time desc;`,
        // `delete from communication_mst;`,
        [],
        (_, { rows }) => {
          // console.log(rows._array[0])
        },
        () => {
          console.log("失敗");
        }
      );
      
    });
  
  }
  
  function onSend(add,icon) {
    
    setLoading(true);
    
    let newMessage = [];
    newMessage[0] = {
      _id: '',
      text: '',
      image: '',
      createdAt: '',
      user: {
        _id: 1,
        name: '店舗',
        status: '',
        title: '',
      }
    }
    
    newMessage[0]._id = String(Number(messages[0]._id)+1);
    
    var date = new Date();

    const formatDate = (current_datetime)=>{
      let formatted_date = 
        current_datetime.getFullYear() + "-" + 
        (current_datetime.getMonth() + 1) + "-" + 
        current_datetime.getDate() + " " + 
        current_datetime.getHours() + ":" + 
        current_datetime.getMinutes() + ":" + 
        current_datetime.getSeconds();
      return formatted_date;
    }
    
    newMessage[0].createdAt = formatDate(date);
    
    if (icon === 'line'){
      
      newMessage[0].user.status = add[0];
      newMessage[0].text = add[1];
      
      let formData = new FormData();
      formData.append('ID',route.params.account);
      formData.append('pass',route.params.password);
      formData.append('customer_id',customer.main.customer_id);
      formData.append('act','get_talk');
      formData.append('LINE_flg',1);
      formData.append('note',add[1]);
      formData.append('formdata_flg',1);
      
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
          setLoading(false);
          setMessages(GiftedChat.append(messages, newMessage));
          setTalk(json['communication']);
        })
        .catch((error) => {
          console.log(error)
          Alert.alert("登録に失敗しました");
        })
    }else if (icon === 'edit'){
      
      newMessage[0].createdAt = add[0];
      newMessage[0].user.status = add[1];
      
      let formData = new FormData();
      formData.append('ID',route.params.account);
      formData.append('pass',route.params.password);
      formData.append('customer_id',customer.main.customer_id);
      formData.append('act','get_talk');
      formData.append('add_flg',1);
      formData.append('communication_id',newMessage[0]['_id']);
      formData.append('status',add[1]);
      formData.append('note',add[2]);
      formData.append('date',add[0]);
      formData.append('formdata_flg',1);
      
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
          setLoading(false);
          Alert.alert('登録しました');
          setMessages(GiftedChat.append(messages, newMessage));
          setTalk(json['communication']);
        })
        .catch((error) => {
          console.log(error)
          Alert.alert("登録に失敗しました");
        })
    }else if (icon === 'mail'){
      
      newMessage[0].createdAt = add[0];
      newMessage[0].user.status = add[1];
      
      if(add[3][8]) {
        var file_name = add[3][8].name;
        var match = /\.(\w+)$/.exec(file_name);
        var type = match ? `image/${match[1]}` : `image`;
      }
      
      let formData = new FormData();
      if(add[3][8]) {
        formData.append('file', { uri: add[3][8].uri, name: file_name, type });
      }
      formData.append('ID',route.params.account);
      formData.append('pass',route.params.password);
      formData.append('customer_id',customer.main.customer_id);
      formData.append('mail_flg',1);
      formData.append('act','get_talk');
      formData.append('reservation_flg',add[3][3]?add[3][3]:'');
      formData.append('draft_flg',add[3][6]?add[3][6]:'');
      formData.append('title',add[3][2]?add[3][2]:'');
      formData.append('date',add[3][4]);
      formData.append('reservation_id',add[3][5]?add[3][5]:'');
      formData.append('mail',add[3][0]);
      formData.append('send',add[3][1]);
      formData.append('note',add[2]);
      formData.append('formdata_flg',1);
      formData.append('del_file',add[3][9]?1:'');
      
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
          setLoading(false);
          
          if(!mail[3] && !mail[6]) {
            Alert.alert('送信しました');
            setMessages(GiftedChat.append(messages, newMessage));
          }
          
          if(add[3][3]) {
            Alert.alert('予約しました');
          }
          
          if(add[3][6]) {
            Alert.alert('下書き保存しました');
          }
          
          setReservation(json['customer_reservation']);
          setTalk(json['communication']);
        })
        .catch((error) => {
          console.log(error)
          Alert.alert("送信に失敗しました");
        })
    }
  }
  
  if(menu){
    Keyboard.dismiss(); // キーボード隠す
  }
  
  // カメラロールから画像またはビデオを選択
  const pickImage = async (item) => {
    
    // カメラロールのアクセス許可を付与
    if (Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      
      if (status !== 'granted') {
        Alert.alert(
          `カメラロールへのアクセスが無効になっています`,
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
      }
    }
    
    if(!customer.line){
      Alert.alert('LINE未連携です');
    } else {
      
      setLoading(true);
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      
      if (!result.cancelled) {
        
        let filename = result.uri.split('/').pop();
  
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        
        let formData = new FormData();
        formData.append('ID',route.params.account);
        formData.append('pass',route.params.password);
        formData.append('customer_id',customer.main.customer_id);
        formData.append('act','get_talk');
        formData.append('LINE_flg',1);
        formData.append('formdata_flg',1);
        formData.append('file', { uri: result.uri, name: filename, type });
        
        fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
      {
        method: 'POST',
        body: formData,
        header: {
          'content-type': 'multipart/form-data',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          setLoading(false);
          setMessages(
            GiftedChat.append(messages,
              [{
                _id:String(Number(messages[0]._id)+1),
                text:'',
                image:result.uri,
                createdAt: new Date(),
                user:{
                  _id: 1,
                  avatar: null,
                  name: "店舗",
                  status: "LINE送信",
                  title: "",
                }
              }]
            )
          );
          setTalk(json['communication']);
        })
        .catch((error) => {
          console.log(error)
          const errorMsg = "ファイルをアップできませんでした";
          Alert.alert(errorMsg);
        })
        
      }
      
    }
    setModal0(false)
	};
	
	// ファイル選択
	const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if(!customer.line){
      Alert.alert('LINE未連携です');
    } else {
      
      setLoading(true);
      if (result) {
        
        let filename = result.uri.split('/').pop();
  
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        
        let formData = new FormData();
        formData.append('ID',route.params.account);
        formData.append('pass',route.params.password);
        formData.append('customer_id',customer.main.customer_id);
        formData.append('act','get_talk');
        formData.append('LINE_flg',1);
        formData.append('file_flg',1);
        formData.append('formdata_flg',1);
        formData.append('file', { uri: result.uri, name: filename, type });
        
        fetch(domain+'batch_app/api_system_app.php?'+Date.now(),
      {
        method: 'POST',
        body: formData,
        header: {
          'content-type': 'multipart/form-data',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          
          setLoading(false);
          setMessages(
            GiftedChat.append(messages,
              [{
                _id:String(Number(messages[0]._id)+1),
                text:'',
                image:'',
                createdAt: new Date(),
                user:{
                  _id: 1,
                  avatar: null,
                  name: "店舗",
                  status: "LINE送信",
                  title: "",
                }
              }]
            )
          );
          setTalk(json['communication']);
        })
        .catch((error) => {
          console.log(error)
          const errorMsg = "ファイルをアップできませんでした";
          Alert.alert(errorMsg);
        })
        
      }
      
    }
    setModal0(false)
  };
	
	// オンライン通話URL挿入
	const online_call = async (id) => {
	  
	  // カメラのアクセス許可を付与
    if (Platform.OS !== 'web') {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        Alert.alert('カメラへのアクセスを許可してください');
        return
      }
    }
    
    // マイクのアクセス許可を付与
    if (Platform.OS !== 'web') {
        const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status !== 'granted') {
        Alert.alert('マイクへのアクセスを許可してください');
        return
      }
    }
	  
    Alert.alert(
      "通話画面を開きますか？",
      "",
      [
        {
          text: "はい",
          onPress: () => {
            fetch(domain+"video/?customer_id="+id,
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: JSON.stringify({
                  id : route.params.account,
                  pass : route.params.password,
                  app_flg : 1,
                })
              })
                .then((response) => response.json())
                .then((json) => {
                  Linking.openURL(json)
                  .catch((err) => {
                    console.log(err);
                    Alert.alert('接続に失敗しました');
                  });
                })
                .catch((error) => {
                  console.log(error)
                  Alert.alert("接続に失敗しました");
                })
          }
        },
        {
          text: "いいえ",
        },
      ]
    );
    
    var url_add = "recording_login_key=t_32"+id+"85up";
    var row     = domain+"video/?"+url_add;
    setMsgtext(msgtext?msgtext+row:row);
    
	}
  
  // アイコン切替
  function menuPress(name) {
    setMenu(true);
    if (name === 1) {
      if(!customer.line){
        Alert.alert('LINE未連携です');
      } else {
        setModal0(true);
      }
      
    } else if (name === 2) {
      setModal1(true);
    } else if (name === 3) {
      setModal2(true);
    } else if (name === 4) {
      setModal3(true);
    } else if (name === 5) {
      setModal4(true);
    }
  }
  
  const [menu_height,setMenu_height] = useState(false);
  const getHeight = (e) => {
    const height = e.nativeEvent.layout.height;
    if (height > 40) {
      setMenu_height(height-40)
    } else {
      setMenu_height(0)
    }
  }
  
  
  return (
    <>
    <Loading isLoading={isLoading} />
    <MyModal6
      isVisible={modal6}
      route={route}
      overlap={overlap}
      navigation={navigation}
      tantou={tantou}
      staff={route.staff}
      cus={customer}
    />
    <MyModal5
      isVisible={modal6?false:modal5}
      tantou={tantou}
      route={route}
      staff={route.staff}
      navigation={navigation}
      cus={customer}
      overlap={overlap}
    />
    <GiftedChat
      messages={messages}
      
      // メッセージ画面を押したときのイベント
      messageOnPress={() => setMenu(false)}
      text={msgtext?msgtext:''}
      onInputTextChanged={text => {setMsgtext(text)}}
      placeholder={customer.line?"テキストを入力してください":""}
      disableComposer={!customer.line?true:false}
      onSend={() => onSend(['LINE送信',msgtext],'line')}
      renderMessage={(props) => {
        return (
          <GestureRecognizer
            onSwipeRight={()=>{backAction()}}
            config={{
              velocityThreshold: 0.3,
              directionalOffsetThreshold: 80,
            }}
            style={{flex: 1}}
          >
            <Message {...props}/>
          </GestureRecognizer>
        );
      }}
      renderBubble={renderBubble}
      renderUsernameOnMessage={false}
      renderStatus={true}
      renderTitle={true}
      renderSend={(props) => {
        return (
          <Send {...props} containerStyle={styles.sendContainer}>
            <Feather name='send' color='gray' size={25} />
          </Send>
        );
      }}
      renderComposer={(props) => {
        if (!customer.line) {
          return (
            <TouchableOpacity
              style={styles.menu_btn}
              activeOpacity={1}
              onPress={() => setMenu(!menu)}
            >
              <Text style={styles.menu_btn_text}>メニュー ▼</Text>
            </TouchableOpacity>
          )
        } else {
          return (<Composer {...props}/>)
        }
      }}
      user={{_id: 1,text:msgtext}}
      textInputStyle={styles.textInput}
      textStyle={{color: "black"}}
      keyboardShouldPersistTaps={'never'}
      // 入力欄クリックした時のイベント
      textInputProps = {{
        onFocus: () => setMenu(false),
      }}
      // プラスボタン
      renderActions={(props) => {
        return (
          // 選択されている送信ツール（LINE、メール、行動内容）のアイコン表示
          <Actions {...props} icon={() => <Feather name={'menu'} color='#1f2d53' size={25} />} />
        );
      }}
      // ↑を押したときのイベント
      onPressActionButton={() => setMenu(!menu)}
      // メニュー開いたらメッセージも上に表示する
      messagesContainerStyle={[
        menu?
          Platform.select({
            ios: {height:400},
            android: {height:550},
          })
          :null,
        menu&&menu_height?
          Platform.select({
            ios: {height:400-menu_height},
            android: {height:550-menu_height},
          })
          :null,
      ]}
      
      onLayout={(e) => getHeight(e)}
      maxComposerHeight={150}
      
      // 入力欄の下のスペース
      bottomOffset={Platform.select({ios: 35})} // 入力欄下の謎のすき間埋める(iosのみ)
      renderInputToolbar={(props) => (
        <InputToolbar 
          {...props}
          editable={false}
          containerStyle={[{
            backgroundColor:'#d9d9d9'},
            menu?{height:255}:'',
            menu&&menu_height?{height:255+menu_height}:'',
          ]}
        />
      )}
      // ↑の中身
      renderAccessory={(props) => 
        <View
          style={[
            styles.border,
            !menu?{display:'none'}:'',
          ]}
        >
          <View style={[styles.menu,{marginTop:15}]}>
            <TouchableOpacity style={!customer.line?{display:"none"}:styles.menuBox} onPress={()=>menuPress(1)} >
              <Feather name='message-circle' color='#1f2d53' size={30} />
              <Text style={styles.iconText}>LINE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBox} onPress={()=>menuPress(2)} >
              <Feather name='mail' color='#1f2d53' size={28} />
              <Text style={styles.iconText}>メール</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBox} onPress={()=>menuPress(3)} >
              <Feather name='edit' color='#1f2d53' size={25} />
              <Text style={styles.iconText}>行動内容</Text>
            </TouchableOpacity>
            <TouchableOpacity style={customer.line&&options?styles.menuBox:{display:"none"}} onPress={() =>online_call(route.customer)}>
              <Feather name='video' color='#1f2d53' size={28} />
              <Text style={styles.iconText}>オンライン{"\n"}通話</Text>
            </TouchableOpacity>
            <MyModal0
              isVisible={modal0}
              onSwipeComplete={() => { setModal0(false) }}
              onPress={()=>{ setModal0(false) }}
              send_image={()=>pickImage()}
              pickDocument={() => pickDocument()}
            />
            <MyModal1
              isVisible={modal1}
              setModal1={setModal1}
              reservation={reservation}
              shop_mail={[
                staff.system_mail,
                staff.yahoomail,
                staff.gmail,
                staff.hotmail,
                staff.outlook,
                staff.softbank,
                staff.icloud,
                staff.original_mail
              ]}
              cus_mail={customer.main ? [
                customer.main.mail1,
                customer.main.mail2,
                customer.main.mail3
              ]:[]}
              setMail={setMail}
              subject={subject}
              route={route}
              onSend={onSend}
              property={property}
              station_list={route.station}
              address={route.address}
              c_d={conditions_date}
              fixed={route.fixed}
              hensu={customer.main ? [
                customer.main.name,
                staff.corporations_name,
                staff.name,
                customer.reverberation.staff_name,
                route.params.name_1+' '+route.params.name_2,
                customer.reverberation.media,
                inquiry_text,
                customer.reverberation.article_url,
                chatbot
              ]:[]}
              mail_select={staff.mail_select}
              options={options}
            />
            <MyModal2
              isVisible={modal2}
              setModal2={setModal2}
              onClose={() => {
                if(add[1]){
                  setModal2(false);
                } else {
                  Alert.alert('確定を押してください');
                }
              }}
              setAdd={setAdd}
              onSend={onSend}
            />
          </View>
          <View style={!customer.line?{display:"none"}:styles.menu}>
            <TouchableOpacity style={styles.menuBox} onPress={()=>menuPress(4)}>
              <Feather name='home' color='#1f2d53' size={28} />
              <Text style={styles.iconText}>オススメ{"\n"}物件</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBox}onPress={()=>menuPress(5)}>
              <Feather name='file-text' color='#1f2d53' size={28} />
              <Text style={styles.iconText}>定型文</Text>
            </TouchableOpacity>
            
            <MyModal3 {...props} 
              isVisible={modal3}
              onSwipeComplete={() => { setModal3(false) }}
              onClose={()=>{ setModal3(false) }}
              route={route}
              property={property}
              station_list={route.station}
              address={route.address}
              c_d={conditions_date}
              msgtext={props.user.text}
              setMsgtext={setMsgtext}
            />
            <MyModal4
              isVisible={modal4}
              onSwipeComplete={() => { setModal4(false) }}
              onPress={()=>{ setModal4(false) }}
              fixed={route.fixed}
              msgtext={msgtext}
              subject={subject}
              setMsgtext={setMsgtext}
              setSubject={setSubject}
              hensu={customer.main ? [
                customer.main.name,
                staff.corporations_name,
                staff.name,
                customer.reverberation.staff_name,
                route.params.name_1+' '+route.params.name_2,
                customer.reverberation.media,
                inquiry_text,
                customer.reverberation.article_url,
                chatbot
              ]:[]}
            />
          </View>
        </View>
      }
    />
    </>
  )

}

const styles = StyleSheet.create({
  menu_btn:{
    flex:1,
    alignItems: 'center',
    height:45,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  menu_btn_text:{
    color:'#1f2d53',
    fontSize:20,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 15,
  },
  textInput: {
    marginTop:5,
    marginRight: 10,
    borderRadius: 10,
    paddingLeft: 5,
    backgroundColor: "white",
    paddingTop: 8,
    lineHeight:20,
    textAlignVertical:'top',
  },
  border: {
    borderTopWidth:1,
    borderColor:'#696969',
    backgroundColor:'rgba(0,0,0,0.5)',
    height:210,
  },
  menu: {
    marginVertical:8,
    width:364,
    height:80,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  menuBox: {
    width:80,
    height:80,
    backgroundColor:'#edf2ff',
    borderWidth:2,
    borderColor:'#1f2d53',
    borderRadius:20,
    marginHorizontal:5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize:12,
    fontWeight:'600',
    color:'#1f2d53',
    marginTop:5,
    textAlign:'center',
  },
  name: {
    color:'#ffffff',
    fontSize:18,
    fontWeight:'500'
  },
});
