import React,{ useState, useEffect, useRef } from 'react';
import {
  StyleSheet, TouchableOpacity, Text, View, TextInput, Switch, Alert, Platform, Button, Image, ScrollView, FlatList, LogBox, KeyboardAvoidingView, Linking, TouchableWithoutFeedback
} from 'react-native';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Moment from 'moment';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialIcons } from 'react-native-vector-icons';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import { CheckBox } from 'react-native-elements';
import MaterialChip from "react-native-material-chip"
import Autocomplete from 'react-native-autocomplete-input';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import RadioButtonRN from 'radio-buttons-react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import ColorPicker from 'react-native-color-picker-ios-android';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// DB接続
import { db } from './Databace';

// let domain = 'http://test.t-up.systems/';
let domain = 'https://www.t-up.systems/';
LogBox.ignoreAllLogs();

export function MyModal0(props){
  
  const { isVisible,onSwipeComplete,onPress,send_image,pickDocument } = props;
  
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['up']}
      onSwipeComplete={onSwipeComplete}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      propagateSwipe={true}
      style={{alignItems: 'center'}}
    >
      <View  style={styles.line}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top:8,
            right:10,
            zIndex:999
          }}
          onPress={onPress}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <View style={{justifyContent: 'center',flexDirection: 'row'}}>
          <TouchableOpacity style={styles.menuBox} onPress={send_image}>
            <Feather name='image' color='#1f2d53' size={28} />
            <Text style={styles.iconText}>画像送信</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBox} onPress={pickDocument}>
            <Feather name='file' color='#1f2d53' size={28} />
            <Text style={styles.iconText}>ファイル{"\n"}送信</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function MyModal1(props){
  
  const { route,isVisible,onSwipeComplete,reservation,shop_mail,cus_mail,subject,onSend,property,station_list,address,c_d,fixed,hensu,mail_online,mail_select,options,options2 } = props;
  
  const [res,setRes] = useState(props.reservation);
  const editorRef = useRef();
  
  useEffect(() => {
    setRes(props.reservation);
  }, [props.reservation])
  
  const [con_flg,setCon_flg] = useState(false);
  
  const [res_id, setRes_id] = useState(null);
  const [draft, setDraft] = useState(null);
  const [note, setNote] = useState('');
  
  const [open, setOpen] = useState(false);
  const [cus_value, setCus_Value] = useState('');
  
  const [inputCursorPosition, setInputCursorPosition] = useState(null);
  
  const items1 = cus_mail.filter(Boolean).map((item) => {
    return ({
      label: item,
      value: item,
    });
  });
  
  const [open2, setOpen2] = useState(false);
  const [shop_value, setShop_Value] = useState('');

  const items2 = shop_mail.filter(Boolean).map((item,key) => {
    return ({
      label: key==0?item.replace('@','_s@'):item,
      value: item,
    });
  });
  
  const [open3, setOpen3] = useState(false);
  const [mail_format, setMail_Format] = useState('0');
  
  const items3 = [
    { label: 'テキスト', value: '0' },
    { label: 'HTML', value: '1' }
  ];

  const [filteredFixed, setFilteredFixed] = useState([]);

  // リストからHTML用の定型文をフィルタリング
  const filterFixedByCategory = (category) => {
    const filtered = fixed.filter((obj) => obj.category !== category);
    setFilteredFixed(filtered);
  }

  useEffect(() => {
    if (mail_format === '0') {
      // 形式がテキストの時は'HTML用'の定型文は表示しない
      filterFixedByCategory('HTML用');
    } else {
      setFilteredFixed(fixed);
    }
  }, [mail_format, fixed]);

  // 内容詳細の編集
  const noteEdit = (text) => {
    let urlPattern = /(^|\s|<.+?>)(https?:\/\/[^\s<>]+)($|\s|<.+?>)/g;

    let extractedText = text.replace(urlPattern, function(match, p1, p2, p3) {
      if (p1.startsWith("<a") || p1.startsWith("<img") || p1.startsWith("<area")) {
        // URLの文字列がa,img,areaのどれかのタグで挟まれていたら、そのままのソースを返す
        return match;
      } else {
        // URLの文字列がその他のHTMLタグかスペースに挟まれていたら、aタグで挟む
        return p1 + "<a href='" + p2 + "'>" + p2 + "</a>" + p3;
      }
    });

    extractedText = extractedText.split('”').join('"');

    setNote(extractedText);
  }

  // 形式を変更した場合は件名と内容を空にする
  const changeMailFormat = (value) => {
    if (mail_format != value) {
      Alert.alert(
        "送信内容の形式を変更しますがよろしいですか？",
        "",
        [
          {
            text: "はい",
            onPress: () => {
              if (note) {
                Alert.alert(
                  "入力されている【件名】と【送信内容】が削除されますがよろしいですか？",
                  "",
                  [
                    {
                      text: "はい",
                      onPress: () => {
                        setMail_Format(value);
                        setNote('');
                        setMail_subject('');
                      }
                    },
                    {
                      text: "いいえ",
                      onPress: () => {
                        return;
                      }
                    },
                  ]
                );
              } else {
                setMail_Format(value);
                setNote('');
                setMail_subject('');
              }
            }
          },
          {
            text: "いいえ",
            onPress: () => {
              return;
            }
          },
        ]
      );
    }
  }
  
  useEffect(() => {
    
    // 宛先
    if (cus_mail.length>0) {
      setCus_Value(cus_mail[0])
    }
    
    // 送信元セット
    
    if (shop_mail.length>0) {
        
      // 既存のメールアドレス
      setShop_Value(mail_select?mail_select:shop_mail[0]);
      
      // 送信元メールアドレスをアドレスによってGmailに自動変更
      if(shop_mail[2] && cus_mail.length>0) {
        if (cus_mail[0].indexOf('@yahoo.co.jp') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@gmail.com') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@au.com') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@ezweb.ne.jp') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@icloud.com') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@hotmail') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@outlook') != -1) {
          setShop_Value(shop_mail[2])
        } else if (cus_mail[0].indexOf('@live.jp') != -1) {
          setShop_Value(shop_mail[2])
        }
        
      }
    }
    
  }, [isVisible])
  
  const [auto_gmail,setAuto_gmail] = useState(false);
  
  if (auto_gmail) {
    
    // 送信元メールアドレスをアドレスによってGmailに自動変更
    if(shop_mail[2] && cus_mail.length>0) {
      
      if (cus_value.indexOf('@yahoo.co.jp') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@gmail.com') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@au.com') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@ezweb.ne.jp') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@icloud.com') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@hotmail') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@outlook') != -1) {
        setShop_Value(shop_mail[2])
      } else if (cus_value.indexOf('@live.jp') != -1) {
        setShop_Value(shop_mail[2])
      }
      
    }
    
    setAuto_gmail(false);
  }
  
  const [mail_subject, setMail_subject] = useState(subject?subject:'');
  useEffect(() => {
    setMail_subject(subject);
  }, [subject])
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [checked, setCheck] = useState(false);
  
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };
  
  // オススメ物件
  const [Property, setProperty] = useState(false);

  const openProperty = () => {
    setProperty(!Property);
  };
  
  // 定型文
  const [Fixed, setFixed] = useState(false);

  const openFixed = () => {
    setFixed(!Fixed);
  };
  
  // HTMLエディタのキーボードを閉じる
  const keyboardClose = () => {
    if (mail_format == '1') {
      editorRef.current.dismissKeyboard();
    }
  };

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    // HTMLエディタのキーボードが表示されている時だけTouchableWithoutFeedbackのdisabledをtrueにする
    if (editorRef.current) {
      if (editorRef.current._focus) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    } else {
      setDisabled(true);
    }
  }, [keyboardClose])

  // HTMLエディタの文字の色
  const [color, setColor] = useState(false);
  const [textColor, setTextColor] = useState('#000');

  const openTextColor = () => {
    setColor(!color);
  };

  // オンライン通話
	const openOnline_call = async (id) => {
    
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
    
    setNote(note?note+row:row);
    
	}
  
  // ファイル選択
  const [filename,setFilename] = useState('');
  const [filedata,setFiledata] = useState(null);
  const [del_file,setDel_file] = useState('');
  
	const pickDocument = async () => {
    
    var result = await DocumentPicker.getDocumentAsync({});
    if (result.canceled != true) {
      
      if(result.assets[0].size > 7000000) {
        Alert.alert('添付ファイルのサイズは7MBまでにしてください');
      }else{
        setFilename(result.assets[0].name);
        setFiledata(result.assets[0]);
      }
      
    }
  };
  
  const LibraryPermissionsCheck = async() => {

    const AsyncAlert = async () => new Promise((resolve) => {
      Alert.alert(
        `カメラロールへのアクセスが無効になっています`,
        "設定画面へ移動しますか？",
        [
          {
            text: "キャンセル",
            style: "cancel",
            onPress:() => {resolve(false);}
          },
          {
            text: "設定する",
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            }
          }
        ]
      );
    });

	  // カメラロールのアクセス許可を付与
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        await AsyncAlert();
        return false;
      } else {
        return true;
      }
    }

  }

  // 画像選択
	const pickImage = async () => {
    
    if (!await LibraryPermissionsCheck()) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled != true) {
      if(result.assets[0].fileSize > 7000000) {
        Alert.alert('添付ファイルのサイズは7MBまでにしてください');
      }else{
        result.name = result.assets[0].uri.split('/').pop()
        setFilename(result.assets[0].fileName);
        setFiledata(result.assets[0]);
      }
      
    }
  };
  
  const onDraft = () => {
    
    if (!cus_value) {
      Alert.alert('メールアドレスがありません');
      return
    }
    
    const formatDate = (current_datetime)=>{
      let formatted_date = 
        current_datetime.getFullYear() + "-" + 
        (current_datetime.getMonth() + 1) + "-" + 
        current_datetime.getDate() + " " + 
        current_datetime.getHours() + ":" + 
        current_datetime.getMinutes() + ":" + "0";
      return formatted_date;
    }
    
    setCon_flg(true);
    props.onSend([formatDate(date),'メール送信',note,[cus_value,shop_value,mail_subject,checked,checked?formatDate(date):'',res_id,1,true,filedata,del_file],mail_format],'mail');
    props.setModal1(false)
    setNote('');
    setCus_Value(cus_mail[0]);
    setShop_Value(shop_mail[0]);
    setMail_subject('');
    setIsEnabled(false);
    setCheck(false);
    setFilename('');
    setFiledata(null);
    setInputCursorPosition(null);
  }

  const onSubmit = () => {
    
    if (!cus_value) {
      Alert.alert('メールアドレスがありません');
      return
    }
    
    setDraft("");
    setCon_flg(true);
    
    const formatDate = (current_datetime)=>{
      let formatted_date = 
        current_datetime.getFullYear() + "-" + 
        (current_datetime.getMonth() + 1) + "-" + 
        current_datetime.getDate() + " " + 
        current_datetime.getHours() + ":" + 
        current_datetime.getMinutes() + ":" + "0";
      return formatted_date;
    }
    
    // 本文入力チェック
    if (note){
      if(!mail_subject){
        Alert.alert(
          "件名が入っていませんがよろしいですか？",
          "",
          [
            {
              text: "はい",
              onPress: () => {
                props.onSend([formatDate(date),'メール送信',note,[cus_value,shop_value,mail_subject,isEnabled||checked,isEnabled||checked?formatDate(date):'',res_id,'',true,filedata],mail_format],'mail');
                props.setModal1(false)
                setNote('');
                setCus_Value(cus_mail[0]);
                setShop_Value(shop_mail[0]);
                setMail_subject('');
                setIsEnabled(false);
                setCheck(false);
                setFilename('');
                setFiledata(null);
                setInputCursorPosition(null);
              }
            },
            {
              text: "いいえ",
              onPress: () => {return}
            },
          ]
        );
      } else {
        props.onSend([formatDate(date),'メール送信',note,[cus_value,shop_value,mail_subject,isEnabled||checked,isEnabled||checked?formatDate(date):'',res_id,'',true,filedata],mail_format],'mail');
        props.setModal1(false)
        setNote('');
        setCus_Value(cus_mail[0]);
        setShop_Value(shop_mail[0]);
        setMail_subject('');
        setIsEnabled(false);
        setCheck(false);
        setFilename('');
        setFiledata(null);
        setInputCursorPosition(null);
      }
    } else {
      Alert.alert('送信内容が記入されていません');
    }
    
  }
  
  const onDelete = () => {
    Alert.alert(
      "削除してよろしいですか？",
      "",
      [
        {
          text: "はい",
          onPress: () => {
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
                  del_reservation:1,
                  customer_id:route.customer,
                  reservation_id:res_id
                })
              })
                .then((response) => response.json())
                .then((json) => {
                  setRes(json['customer_reservation']);
                  Alert.alert('削除しました');
                })
                .catch((error) => {
                  const errorMsg = "削除に失敗しました";
                  Alert.alert(errorMsg);
                })
                
            setNote('');
            setCus_Value(cus_mail[0]);
            setShop_Value(shop_mail[0]);
            setMail_subject('');
            setIsEnabled(false);
            setCheck(false);
            setFilename('');
            setFiledata(null);
            setInputCursorPosition(null);
          }
        },
        {
          text: "いいえ",
        },
      ]
    );
  }
  
  const onClose = () => {
    props.setModal1(false)
    setNote('');
    setCus_Value(cus_mail[0]);
    setShop_Value(shop_mail[0]);
    setMail_subject('');
    setIsEnabled(false);
    setCheck(false);
    setFilename('');
    setFiledata(null);
    setInputCursorPosition(null);
  }
  
  const img_Delete = () => {
    setFilename('');
    setFiledata(null);
    setDel_file(1);
  }
  
  const [a, setA] = useState(false);

  const [op, setOp] = useState(false);
  const [val, setVal] = useState(false);
  
  function rrr(){
    
    if (a){
      
      axios.get(val.file_path)
        .then(res => {
          setFilename(val.file_path?'添付ファイル':'');
          setFiledata({uri:res.config.url});
        })
        .catch((error) => {
          console.log(error);
        })
      
      setNote(val.note);
      setCus_Value(val.receive_mail);
      setShop_Value(val.send_mail);
      setMail_subject(val.title);
      setDraft(val.draft_flg);
      
      if (val.time) {
        
        setIsEnabled(true);
        setCheck(true);
        
        const res_time = new Date(
          val.time.substr(0,4),
          val.time.substr(5,2),
          val.time.substr(8,2),
          val.time.substr(11,2),
          val.time.substr(14,2),
          "00"
        )
        res_time.setMonth(res_time.getMonth() - 1);
        setDate(res_time);
      }else{
        setDate(new Date());
      }
      
      setRes_id(val.reservation_id)
      
      setA(false);
    }
    
    if (res){
      const it = res.filter(Boolean).map((item) => {
        if(item.draft_flg) {
          return ({
            label: '【下書き】'+item.title,
            value: item,
          });
        } else {
          return ({
            label: '【予約】'+item.time+"\n"+item.title,
            value: item,
          });
        }
      });
      
      it.unshift({label:'----------------',value:''});
      
      return(
        <>
          <Text style={styles.label}>予約・下書き</Text>
          <DropDownPicker
            open={op}
            value={val}
            items={it}
            setOpen={setOp}
            setValue={setVal}
            style={styles.inputInner}
            placeholder = {'----------------'}
            onClose={() => {setA('a')}}
            zIndex={5000}
            translation={{
              NOTHING_TO_SHOW: "予約・下書きはありません"
            }}
          />
          
          <TouchableOpacity onPress={onDelete} 
            style={[val? '':{display: 'none'},styles.delete]}>
            <Text>削　除</Text>
          </TouchableOpacity>
        </>
      )
    }
  }

  function mail_reservation() {
    
    if (Platform.OS === 'ios') {
      return (
        <View>
          <View style={styles.input}>
            <Text style={styles.label}>メール予約</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#40ff00" }}
              thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setIsEnabled(!isEnabled)}
              value={isEnabled}
            />
          </View>
          <View style={[isEnabled === true ? '':{display: 'none'},styles.input]}>
            <Text style={styles.label}>予約時間</Text>
            <DateTimePicker
              value={date}
              mode={'datetime'}
              is24Hour={true}
              display="default"
              locale={'ja'}
            />
          </View>
        </View>
      );
    } else if (Platform.OS === 'android') {
      return (
        <View>
          <View style={styles.input}>
            <CheckBox
              title='メール予約する'
              checked={checked}
              onPress={() => setCheck(!checked)}
            />
          </View>
          <View style={[checked === true ? '':{display: 'none'},styles.input]}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Button onPress={showDatepicker} title={Moment(date).format("YYYY-MM-DD")} />
              </View>
              <View style={{marginLeft:10}}>
                <Button onPress={showTimepicker} title={Moment(date).format("HH:mm")} />
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>
          </View>
        </View>
      );
    }
  }

  const [fontsize,setFontsize] = useState(3);

  const fontSize = (size) => {
    // 1= 10px, 2 = 13px, 3 = 16px, 4 = 18px, 5 = 24px, 6 = 32px, 7 = 48px;
    const newSize = size ? fontsize + 1 : fontsize - 1;
    
    const clampedSize = Math.min(7, Math.max(1, newSize));
    
    editorRef.current?.setFontSize(clampedSize);
    setFontsize(clampedSize);
  };
  
  useEffect(() => {
    if (textColor) {
      editorRef.current?.setForeColor(textColor);
    }
  }, [textColor])

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      onModalHide={() => {setCon_flg(false)}}
      onBackdropPress={onClose}
    >
      <MyModal3 
        isVisible={Property}
        onSwipeComplete={() => { setProperty(false) }}
        onClose={() => { setProperty(false) }}
        route={route}
        property={property}
        station_list={station_list}
        address={address}
        c_d={c_d}
        setNote={setNote}
        msgtext={note}
        mail_format={mail_format}
        editorRef={editorRef}
        inputCursorPosition={inputCursorPosition}
      />
      <MyModal4 
        isVisible={Fixed}
        onSwipeComplete={() => { setFixed(false) }}
        onPress={() => { setFixed(false) }}
        fixed={filteredFixed}
        hensu={hensu}
        setMail_subject={setMail_subject}
        setNote={setNote}
        setFixed={setFixed}
        mail_format={mail_format}
        editorRef={editorRef}
      />
      <View style={[styles.sydemenu,{top: Platform.OS === "ios" ? 20 : 0}]}>
        <TouchableOpacity
          style={styles.menucircle}
          onPress={openProperty}
        >
          <Feather name='home' color='#1f2d53' size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menucircle}
          onPress={openFixed}
        >
          <Feather name='file-text' color='#1f2d53' size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          style={options?styles.menucircle:{display:"none"}}
          onPress={() => {openOnline_call(route.customer)}}
        >
          <Feather name='video' color='#1f2d53' size={28} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[{height:650},styles.modalInner]}>
          <TouchableOpacity
            style={styles.close}
            onPress={onClose}
          >
            <Feather name='x-circle' color='gray' size={35} />
          </TouchableOpacity>
          <View style={styles.form}>
            {/* <ScrollView 
              style={{height:Platform.OS === "ios" ? 400 : 500}}
            > */}
            <TouchableWithoutFeedback
              disabled={disabled}
              onPress={keyboardClose}
            >
              <View>
                <FlatList
                  style={{height: mail_format == '1' ? 200 : 500}}
                  data={[(
                    <>
                      {rrr()}
                      <Text style={styles.label}>宛先</Text>
                      <DropDownPicker
                        open={open}
                        value={cus_value}
                        items={items1}
                        setOpen={setOpen}
                        setValue={setCus_Value}
                        style={styles.inputInner}
                        placeholder = {'----------------'}
                        zIndex={101}
                        translation={{
                          NOTHING_TO_SHOW: "メールアドレスが登録されていません"
                        }}
                        onClose={() => {setAuto_gmail(1)}}
                      />
                      <Text style={styles.label}>送信元</Text>
                      <DropDownPicker
                        open={open2}
                        value={shop_value}
                        items={items2}
                        setOpen={setOpen2}
                        setValue={setShop_Value}
                        style={styles.inputInner}
                        placeholder={'----------------'}
                        zIndex={100}
                      />
                      {options2 && options2.includes('1') && (
                        <>
                          <Text style={styles.label}>形式</Text>
                          <View style={{ zIndex: 99 }}>
                            <DropDownPicker
                              open={open3}
                              value={mail_format}
                              items={items3}
                              setOpen={setOpen3}
                              style={[styles.inputInner,{width: 200}]}
                              dropDownContainerStyle={{width: 200}}
                              placeholder={'----------------'}
                              onOpen={() => {
                                setOpen3(!open3);
                              }}
                              onSelectItem={(item)=>changeMailFormat(item.value)}
                            />
                          </View>
                        </>
                      )}
                      <View style={styles.input}>
                        <Text style={styles.label}>件名</Text>
                        <TextInput
                          onChangeText={(text) => setMail_subject(text)}
                          value={mail_subject}
                          style={styles.inputInner}
                        />
                      </View>
                      <View style={[styles.input,{flexDirection: 'row',alignItems: 'center'}]}>
                        <TouchableOpacity onPress={pickDocument} style={styles.file}>
                          <Text>ファイル添付</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={styles.file}>
                          <Text>画像添付</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={filename?{flexDirection: 'row',marginVertical:5}:{display:'none'}}>
                        <TouchableOpacity onPress={img_Delete} style={filename?{marginHorizontal:5}:{display:'none'}}>
                          <Feather name='x-circle' color='gray' size={25} />
                        </TouchableOpacity>
                        <Text>{filename}</Text>
                      </View>
                      <Text style={styles.inlabel}>※携帯電話に送る際は2MB以下にしてください</Text>
                      <View zIndex={99}>{mail_reservation()}</View>
                      <View style={styles.input}>
                        {mail_format !== '1' ? (
                          <>
                            <Text style={styles.label}>内容詳細</Text>
                            <TextInput
                              onChangeText={(text) => {setNote(text)}}
                              value={note}
                              style={styles.textarea}
                              multiline={true}
                              disableFullscreenUI={true}
                              numberOfLines={11}
                              onSelectionChange={(event) => {setInputCursorPosition(event.nativeEvent.selection);}}
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </View>
                    </>
                  )]}
                  renderItem={({ item }) => (
                    <>{item}</>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
            {mail_format == '1' ? (
              <>
                <MyModal8 
                  isVisible={color}
                  openTextColor={openTextColor}
                  setTextColor={setTextColor}
                  textColor={textColor}
                />
                <View style={[{marginBottom: 5,flexDirection: 'row',alignItems: 'center'}]}>
                  <Text style={styles.label}>内容詳細</Text>
                </View>
                <RichToolbar
                  editor={editorRef}
                  iconTint={"black"}
                  selectedIconTint={"white"}
                  actions={[
                    actions.keyboard,
                    actions.undo,
                    actions.redo,
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.insertLine,
                    actions.setStrikethrough,
                    'fontSize_add',
                    'fontSize_pull',
                    'ForeColor',
                    actions.indent,
                    actions.outdent,
                    actions.alignLeft,
                    actions.alignCenter,
                    actions.alignRight,
                    actions.alignFull,
                    actions.setSubscript,
                    actions.setSuperscript,
                    actions.checkboxList,
                  ]}
                  iconMap={{
                    fontSize_add: ({ tintColor }) => (
                      <TouchableOpacity onPress={()=>fontSize(true)}>
                        <MaterialCommunityIcons name="format-font-size-increase" size={24} color={tintColor} />
                      </TouchableOpacity>
                    ),
                    fontSize_pull: ({ tintColor }) => (
                      <TouchableOpacity onPress={()=>fontSize(false)}>
                        <MaterialCommunityIcons name="format-font-size-decrease" size={24} color={tintColor} />
                      </TouchableOpacity>
                    ),
                    ForeColor: ({ tintColor }) => (
                      <TouchableOpacity onPress={openTextColor}>
                        <MaterialIcons name="format-color-text" size={24} color={tintColor} />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <RichEditor
                  ref={editorRef}
                  style={styles.editor}
                  onChange={(text) => noteEdit(text)}
                  initialHeight={220}
                  onMessage={(data)=>{
                    var txt = data.data;
                    var check_txt = '';
                    if (txt.length > 5) {
                      check_txt = txt.slice(-5);
                    } else {
                      check_txt = txt;
                    }
                    setInputCursorPosition(check_txt.trim());
                  }}
                />
              </>
            ) : (
              <></>
            )}
            {/* </ScrollView> */}
            <View style={{flexDirection: 'row',alignSelf: 'center',marginBottom:10}}>
              <TouchableOpacity onPress={onDraft} style={styles.draft}>
                <Text>下書き保存</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmit} style={styles.submit}>
                <Text style={styles.submitText}>{isEnabled||checked?"予　約":"送　信"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function MyModal2(props){
  
  const { isVisible,onSwipeComplete,onSend } = props;
  
  const [con_flg,setCon_flg] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [items1, setItems1] = useState([
    {label: 'メール送信', value: 'メール送信'},
    {label: 'メール受信', value: 'メール受信'},
    {label: '資料送付', value: '資料送付'},
    {label: '電話連絡(担当→お客様)', value: '電話連絡(担当→お客様)'},
    {label: '電話連絡(お客様→担当)', value: '電話連絡(お客様→担当)'},
    {label: 'その他', value: 'その他'}
  ]);
  
  const [action_text,setAction_text] = useState(null)
  
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };
  
  const [isSelected, setSelection] = useState(false);
  
  const onSubmit = () => {
    
    if(!status) {
      Alert.alert('行動を選択してください');
    } else {
      
      const formatDate = (current_datetime)=>{
        let formatted_date = 
          current_datetime.getFullYear() + "-" + 
          (current_datetime.getMonth() + 1) + "-" + 
          current_datetime.getDate() + " " + 
          current_datetime.getHours() + ":" + 
          current_datetime.getMinutes() + ":" + "0";
        return formatted_date;
      }
    
      setCon_flg(true);
      props.setModal2(false)
      props.onSend([formatDate(date),status,action_text],'edit');
    }
    
  }
  
  const onClose = () => {
    props.setModal2(false)
  }
  
  function action_date() {
    if (Platform.OS === 'ios') {
      return (
        <View>
          <View style={styles.input}>
            <Text style={styles.label}>日時</Text>
            <DateTimePicker
              value={date}
              mode={'datetime'}
              is24Hour={true}
              display="default"
              locale={'ja'}
            />
          </View>
        </View>
      );
    } else if (Platform.OS === 'android') {
      return (
        <View>
          <View style={styles.input}>
            <Text style={styles.label}>日時</Text>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Button onPress={showDatepicker} title={Moment(date).format("YYYY-MM-DD")} />
              </View>
              <View style={{marginLeft:10}}>
                <Button onPress={showTimepicker} title={Moment(date).format("HH:mm")} />
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>
          </View>
        </View>
      );
    }
  }
  
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      onModalHide={() => {setCon_flg(false)}}
      onBackdropPress={onClose}
    >
    <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[{height:500},styles.bottom,styles.modalInner]}>
        <TouchableOpacity
          style={styles.close}
          onPress={onClose}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <View style={styles.form}>
          <View style={styles.input}>{action_date()}</View>
          <DropDownPicker
            open={open}
            value={status}
            items={items1}
            setOpen={setOpen}
            setValue={setStatus}
            setItems={setItems1}
            style={styles.inputInner}
            placeholder = "選択してください"
            zIndex={1000}
            maxHeight={300}
          />
          <View style={styles.input}>
            <Text style={styles.label}>内容詳細</Text>
            <TextInput
              onChangeText={(text) => {setAction_text(text)}}
              value={action_text}
              style={styles.textarea}
              multiline={true}
              disableFullscreenUI={true}
              numberOfLines={11}
            />
          </View>
          <TouchableOpacity onPress={onSubmit} style={styles.submit}>
            <Text style={styles.submitText}>登　録</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function MyModal3(props){
  
  const { route,isVisible,onSwipeComplete,onClose,msgtext,property,station_list,address,c_d,mail_format,editorRef,inputCursorPosition } = props;
  
  const [isRecommended, setRecommended] = useState(false);

  const recommended = () => {
    setRecommended(!isRecommended);
  };
  
  const [article_name,setArticle_name] = useState(''); // 物件名
  
  const [open_rent_from,setOpen_Rent_from] = useState(false); // 賃料下限
  const [value_rent_from,setValue_Rent_from] = useState(false);
  const [rent_from, setRent_from] = useState([
    {label: '------------', value: ''},
    {label: '1.0万円', value: '10000'},
    {label: '1.5万円', value: '15000'},
    {label: '2.0万円', value: '20000'},
    {label: '2.5万円', value: '25000'},
    {label: '3.0万円', value: '30000'},
    {label: '3.5万円', value: '35000'},
    {label: '4.0万円', value: '40000'},
    {label: '4.5万円', value: '45000'},
    {label: '5.0万円', value: '50000'},
    {label: '5.5万円', value: '55000'},
    {label: '6.0万円', value: '60000'},
    {label: '6.5万円', value: '65000'},
    {label: '7.0万円', value: '70000'},
    {label: '7.5万円', value: '75000'},
    {label: '8.0万円', value: '80000'},
    {label: '8.5万円', value: '85000'},
    {label: '9.0万円', value: '90000'},
    {label: '9.5万円', value: '95000'},
    {label: '10万円', value: '100000'},
    {label: '11万円', value: '110000'},
    {label: '12万円', value: '120000'},
    {label: '13万円', value: '130000'},
    {label: '14万円', value: '140000'},
    {label: '15万円', value: '150000'},
    {label: '16万円', value: '160000'},
    {label: '17万円', value: '170000'},
    {label: '18万円', value: '180000'},
    {label: '19万円', value: '190000'},
    {label: '20万円', value: '200000'},
    {label: '21万円', value: '210000'},
    {label: '22万円', value: '220000'},
    {label: '23万円', value: '230000'},
    {label: '24万円', value: '240000'},
    {label: '25万円', value: '250000'},
    {label: '26万円', value: '260000'},
    {label: '27万円', value: '270000'},
    {label: '28万円', value: '280000'},
    {label: '29万円', value: '290000'},
    {label: '30万円', value: '300000'},
    {label: '31万円', value: '310000'},
    {label: '32万円', value: '320000'},
    {label: '33万円', value: '330000'},
    {label: '34万円', value: '340000'},
    {label: '35万円', value: '350000'},
    {label: '36万円', value: '360000'},
    {label: '37万円', value: '370000'},
    {label: '38万円', value: '380000'},
    {label: '39万円', value: '390000'},
    {label: '40万円', value: '400000'},
    {label: '50万円', value: '500000'},
    {label: '100万円', value: '1000000'}
  ]);
  
  const [open_rent_to,setOpen_Rent_to] = useState(false); // 賃料上限
  const [value_rent_to,setValue_Rent_to] = useState(false);
  const [rent_to, setRent_to] = useState([
    {label: '------------', value: ''},
    {label: '1.5万円', value: '15000'},
    {label: '2.0万円', value: '20000'},
    {label: '2.5万円', value: '25000'},
    {label: '3.0万円', value: '30000'},
    {label: '3.5万円', value: '35000'},
    {label: '4.0万円', value: '40000'},
    {label: '4.5万円', value: '45000'},
    {label: '5.0万円', value: '50000'},
    {label: '5.5万円', value: '55000'},
    {label: '6.0万円', value: '60000'},
    {label: '6.5万円', value: '65000'},
    {label: '7.0万円', value: '70000'},
    {label: '7.5万円', value: '75000'},
    {label: '8.0万円', value: '80000'},
    {label: '8.5万円', value: '85000'},
    {label: '9.0万円', value: '90000'},
    {label: '9.5万円', value: '95000'},
    {label: '10万円', value: '100000'},
    {label: '11万円', value: '110000'},
    {label: '12万円', value: '120000'},
    {label: '13万円', value: '130000'},
    {label: '14万円', value: '140000'},
    {label: '15万円', value: '150000'},
    {label: '16万円', value: '160000'},
    {label: '17万円', value: '170000'},
    {label: '18万円', value: '180000'},
    {label: '19万円', value: '190000'},
    {label: '20万円', value: '200000'},
    {label: '21万円', value: '210000'},
    {label: '22万円', value: '220000'},
    {label: '23万円', value: '230000'},
    {label: '24万円', value: '240000'},
    {label: '25万円', value: '250000'},
    {label: '26万円', value: '260000'},
    {label: '27万円', value: '270000'},
    {label: '28万円', value: '280000'},
    {label: '29万円', value: '290000'},
    {label: '30万円', value: '300000'},
    {label: '31万円', value: '310000'},
    {label: '32万円', value: '320000'},
    {label: '33万円', value: '330000'},
    {label: '34万円', value: '340000'},
    {label: '35万円', value: '350000'},
    {label: '36万円', value: '360000'},
    {label: '37万円', value: '370000'},
    {label: '38万円', value: '380000'},
    {label: '39万円', value: '390000'},
    {label: '40万円', value: '400000'},
    {label: '50万円', value: '500000'},
    {label: '100万円', value: '1000000'}
  ]);
  
  const [general, setGeneral] = useState(false);
  const [deposit, setDeposit] = useState(false);

  const [open_layout, setOpen_layout] = useState(false); // 間取り
  const [value_layout, setValue_layout] = useState(null);
  const [layout, setLayout] = useState([
    {label: '1R', value: '1R'},
    {label: '1K', value: '1K'},
    {label: '1DK', value: '1DK'},
    {label: '1LDK', value: '1LDK'},
    {label: '2K', value: '2K'},
    {label: '2DK', value: '2DK'},
    {label: '2LDK', value: '2LDK'},
    {label: '3K', value: '3K'},
    {label: '3DK', value: '3DK'},
    {label: '3LDK', value: '3LDK'},
    {label: '4K～', value: '4K～'}
  ]);
  
  const [stations,setStations] = useState('');

  if(stations){
    var get_station = stations.map(value => {
      return {id: value.station_code, name: value.station_name+'('+value.line_name+')'}
    })
  }
  
  const [filteredStations, setFilteredStations] = useState([]); // 沿線・駅名
  const [selectedStations, setSelectedStations] = useState([]);
  
  const findStation = (query) => {
    if (query) {
      const regex = new RegExp(`${query.trim()}`, 'i');
      setFilteredStations(
        station_list.filter((station) => station.name.search(regex) >= 0)
      );
    } else {
      setFilteredStations([]);
    }
  };
  
  // 選択した駅を削除
  const station_delete = (props) => {
    setSelectedStations(
      selectedStations.filter((v) => {
        return (v.id !== props.id);
      })
    )
  }
  
  const [station_time,setStation_time] = useState(''); // 徒歩分数
  
  const [area,setArea] = useState('');
  
  if(area){
    var get_area = area.map(value => {
      return {id: value.address_code, name: value.address}
    })
  }
  
  const [filteredAddress, setFilteredAddress] = useState([]); // エリア
  const [selectedAddress, setSelectedAddress] = useState([]);

  const findAddress = (query) => {
    if (query) {
      const regex = new RegExp(`${query.trim()}`, 'i');
      if(address) {
        setFilteredAddress(
          address.filter((area) => area.name.search(regex) >= 0)
        );
      }
    } else {
      setFilteredAddress([]);
    }
  };
  
  // 選択したエリアを削除
  const area_delete = (props) => {
    setSelectedAddress(
      selectedAddress.filter((v) => {
        return (v.id !== props.id);
      })
    )
  }
  
  const [open_exclusive_from, setOpen_Exclusive_from] = useState(false); // 面積下限
  const [value_exclusive_from, setValue_Exclusive_from] = useState(null);
  const [exclusive_from,setExclusive_from] = useState([
    {label: '------------', value: ''},
    {label: '15㎡未満', value: '15'},
    {label: '20㎡', value: '20'},
    {label: '21㎡', value: '21'},
    {label: '22㎡', value: '22'},
    {label: '23㎡', value: '23'},
    {label: '24㎡', value: '24'},
    {label: '25㎡', value: '25'},
    {label: '26㎡', value: '26'},
    {label: '27㎡', value: '27'},
    {label: '28㎡', value: '28'},
    {label: '29㎡', value: '29'},
    {label: '30㎡', value: '30'},
    {label: '35㎡', value: '35'},
    {label: '40㎡', value: '40'},
    {label: '45㎡', value: '45'},
    {label: '50㎡', value: '50'},
    {label: '55㎡', value: '55'},
    {label: '60㎡', value: '60'},
    {label: '65㎡', value: '65'},
    {label: '70㎡', value: '70'},
    {label: '75㎡', value: '75'},
    {label: '80㎡', value: '80'},
    {label: '85㎡', value: '85'},
    {label: '90㎡', value: '90'},
    {label: '95㎡', value: '95'},
    {label: '100㎡以上', value: '100'},
  ]);
  
  const [open_exclusive_to, setOpen_Exclusive_to] = useState(false); // 面積上限
  const [value_exclusive_to, setValue_Exclusive_to] = useState(null);
  const [exclusive_to,setExclusive_to] = useState([
    {label: '------------', value: ''},
    {label: '15㎡未満', value: '15'},
    {label: '20㎡', value: '20'},
    {label: '21㎡', value: '21'},
    {label: '22㎡', value: '22'},
    {label: '23㎡', value: '23'},
    {label: '24㎡', value: '24'},
    {label: '25㎡', value: '25'},
    {label: '26㎡', value: '26'},
    {label: '27㎡', value: '27'},
    {label: '28㎡', value: '28'},
    {label: '29㎡', value: '29'},
    {label: '30㎡', value: '30'},
    {label: '35㎡', value: '35'},
    {label: '40㎡', value: '40'},
    {label: '45㎡', value: '45'},
    {label: '50㎡', value: '50'},
    {label: '55㎡', value: '55'},
    {label: '60㎡', value: '60'},
    {label: '65㎡', value: '65'},
    {label: '70㎡', value: '70'},
    {label: '75㎡', value: '75'},
    {label: '80㎡', value: '80'},
    {label: '85㎡', value: '85'},
    {label: '90㎡', value: '90'},
    {label: '95㎡', value: '95'},
    {label: '100㎡以上', value: '100'},
  ]);
  
  const [detail, setDetail] = useState(false); // 詳細ボタン
  
  // 以下詳細
  
  const [article_id,setArticle_id] = useState(''); // 物件番号
  
  const [open_category, setOpen_Category] = useState(false); // 物件種別
  const [value_category, setValue_Category] = useState(null);
  const [category, setCategory] = useState([
    {label: 'アパート', value: 'アパート'},
    {label: 'タウンハウス', value: 'タウンハウス'},
    {label: 'テラスハウス', value: 'テラスハウス'},
    {label: 'マンション', value: 'マンション'},
    {label: '一戸建', value: '一戸建'}
  ]);
  
  const [open_constructure, setOpen_Constructure] = useState(false); // 建物構造
  const [value_constructure, setValue_Constructure] = useState(null);
  const [constructure, setConstructure] = useState([
    {label: 'ALC', value: 'ALC'},
    {label: 'HPC', value: 'HPC'},
    {label: 'PC', value: 'PC'},
    {label: 'ブロック', value: 'ブロック'},
    {label: '木造', value: '木造'},
    {label: '軽量鉄骨', value: '軽量鉄骨'},
    {label: '鉄筋コンクリート造', value: '鉄筋コンクリート造'},
    {label: '鉄筋鉄骨コンクリート造', value: '鉄筋鉄骨コンクリート造'},
    {label: '鉄骨造', value: '鉄骨造'}
  ]);
  
  const [open_built, setOpen_Built] = useState(false); // 築年数
  const [value_built, setValue_Built] = useState(null);
  const [built, setBuilt] = useState([
    {label: '新築', value: '1'},
    {label: '～5年', value: '5'},
    {label: '～10年', value: '10'},
    {label: '～15年', value: '15'},
    {label: '～20年', value: '20'},
    {label: '指定なし', value: ''}
  ]);
  
  const [open_setubi, setOpen_Setubi] = useState(false); // 条件・設備
  const [value_setubi, setValue_Setubi] = useState(null);
  const [setubi, setSetubi] = useState([
    {label: '棟条件設備', value: 'building',},
    {label: 'ペット相談', value: 'ペット相談', parent: 'building'},
    {label: 'ガレージ(近隣含まない)', value: 'ガレージ', parent: 'building'},
    {label: 'バイク', value: 'バイク', parent: 'building'},
    {label: '楽器', value: '楽器', parent: 'building'},
    {label: 'エレベータ', value: 'エレベータ', parent: 'building'},
    {label: 'オートロック', value: 'オートロック', parent: 'building'},
    {label: '宅配ボックス', value: '宅配ボックス', parent: 'building'},
    
    {label: '部屋条件設備', value: 'room',},
    {label: '都市ガス', value: '都市ガス', parent: 'room'},
    {label: 'セパレート', value: 'セパレート', parent: 'room'},
    {label: '室内洗濯機', value: '室内洗濯機', parent: 'room'},
    {label: '独立洗面', value: '独立洗面', parent: 'room'},
    {label: 'フローリング', value: 'フローリング', parent: 'room'},
    {label: 'システムキッチン', value: 'システムキッチン', parent: 'room'},
    {label: '追い焚き', value: '追い焚き', parent: 'room'},
    {label: '2階以上', value: '2階以上', parent: 'room'},
    {label: 'エアコン', value: 'エアコン', parent: 'room'},
    {label: 'ロフト', value: 'ロフト', parent: 'room'},
    {label: 'バルコニー', value: 'バルコニー', parent: 'room'},
    {label: '専用庭', value: '専用庭', parent: 'room'},
    {label: '浴室乾燥', value: '浴室乾燥', parent: 'room'},
    {label: 'TVインターフォン', value: 'TVインターフォン', parent: 'room'},
    {label: 'インターネット', value: 'インターネット', parent: 'room'},
    {label: 'インターネット無料', value: 'インターネット無料', parent: 'room'},
    {label: '照明', value: '照明', parent: 'room'},
    {label: '角部屋', value: '角部屋', parent: 'room'},
    {label: '分譲タイプ', value: '分譲タイプ', parent: 'room'},
    {label: '最上階', value: '最上階', parent: 'room'},
    {label: '1階', value: '1階', parent: 'room'},
    {label: '現況確認日30日以上経過を含む', value: '現況確認日30日', parent: 'room'},
    
    {label: 'コンロ', value: 'stove'},
    {label: '電気', value: '電気', parent: 'stove'},
    {label: 'IH', value: 'IH', parent: 'stove'},
    {label: 'ガス', value: 'ガス', parent: 'stove'}
  ]);
  
  const [open_stove, setOpen_Stove] = useState(false); // コンロ
  const [value_stove, setValue_Stove] = useState(null);
  const [stove, setStove] = useState([
    {label: '------------', value: ''},
    {label: '電気', value: '電気'},
    {label: 'IH', value: 'IH'},
    {label: 'ガス', value: 'ガス'}
  ]);
  
  const [open_direction, setOpen_Direction] = useState(false); // 主要採光面
  const [value_direction, setValue_Direction] = useState(null);
  const [direction, setDirection] = useState([
    {label: '北', value: '北'},
    {label: '北東', value: '北東'},
    {label: '東', value: '東'},
    {label: '南東', value: '南東'},
    {label: '南', value: '南'},
    {label: '南西', value: '南西'},
    {label: '西', value: '西'},
    {label: '北西', value: '北西'}
  ]);
  
  useEffect(() => {
    if(c_d) {
    setArticle_name(c_d.article_name?c_d.article_name:'');
    setValue_Rent_from(c_d.rent_from?c_d.rent_from:false);
    setValue_Rent_to(c_d.rent_to?c_d.rent_to:false);
    setGeneral(c_d.general?true:false);
    setDeposit(c_d.deposit?true:false);
    setValue_layout(c_d.layout?c_d.layout.split(','):null);
    setStations(c_d.station?c_d.station:false);
    setStation_time(c_d.station_time?c_d.station_time:'');
    setArea(c_d.area?c_d.area:false);
    setValue_Exclusive_from(c_d.exclusive_from?c_d.exclusive_from:null);
    setValue_Exclusive_to(c_d.exclusive_to?c_d.exclusive_to:null);
    setArticle_id(c_d.article_id?c_d.article_id:'');
    setValue_Category(c_d.category?c_d.category.split(','):null);
    setValue_Constructure(c_d.constructure?c_d.constructure.split(','):null);
    setValue_Built(c_d.built?c_d.built:null);
    setValue_Setubi(c_d.setubi?c_d.setubi.split(','):null);
    setValue_Stove(c_d.stove?c_d.stove:null);
    setValue_Direction(c_d.direction?c_d.direction.split(','):null);
    }
  }, [c_d])
  
  useEffect(() => {
    setSelectedStations(get_station?get_station:[]);
  }, [stations])
  
  useEffect(() => {
    setSelectedAddress(get_area?get_area:[]);
  }, [area])
  
  const [search,setSearch] = useState(false);
  
  const [save, setSave] = useState(true); // 条件保存
  
  if (selectedStations.length){
    var station = selectedStations.map(sv => 
      sv.id
    )
  }
  
  if (selectedAddress.length){
    var areas = selectedAddress.map(sv => 
      sv.id
    )
  }
  
  const onSubmit = () => {
    
    const search_entry = {
    article_name:article_name,
    rent_from:value_rent_from,
    rent_to:value_rent_to,
    general:general,
    deposit:deposit,
    layout:value_layout?`${value_layout}`:null,
    station:station?`${station}`:null,
    station_time:station_time,
    area:areas?`${areas}`:null,
    exclusive_from:value_exclusive_from,
    exclusive_to:value_exclusive_to,
    article_id:article_id,
    category:value_category?`${value_category}`:null,
    constructure:value_constructure?`${value_constructure}`:null,
    built:value_built,
    setubi:value_setubi?`${value_setubi}`:null,
    stove:value_stove,
    direction:direction===null?`${value_direction}`:null,
  }
    setSearch(search_entry);
    setRecommended(!isRecommended);
  }
  
    useEffect(() => {
      if(search){
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
              article_search_flg:1,
              save_flg:save?1:false,
              article_name:search.article_name,
              rent_from:search.rent_from,
              rent_to:search.rent_to,
              general:search.general,
              deposit:search.deposit,
              layout:search.layout,
              station:search.station,
              station_time:search.station_time,
              area:search.area,
              exclusive_from:search.exclusive_from,
              exclusive_to:search.exclusive_to,
              article_id:search.article_id,
              category:search.category,
              constructure:search.constructure,
              built:search.built,
              setubi:search.setubi,
              stove:search.stove,
              direction:search.direction,
            })
          })
            .then((response) => response.json())
            .then((json) => {
              setSearch_results(json['article_search_list']);
            })
            .catch((error) => {
              const errorMsg = "検索に失敗しました";
              console.log(error);
              Alert.alert(errorMsg);
            })
      }
      
    }, [search])
  
  const onDelete = () => {
    setArticle_name('');
    setValue_Rent_from(false);
    setValue_Rent_to(false);
    setGeneral(false);
    setDeposit(false);
    setValue_layout(null);
    setSelectedStations([]);
    setStation_time('');
    setSelectedAddress([]);
    setValue_Exclusive_from(null);
    setValue_Exclusive_to(null);
    setArticle_id('');
    setValue_Category(null);
    setValue_Constructure(null);
    setValue_Built(null);
    setValue_Setubi(null);
    setValue_Direction(null);
  }
  
  const [search_results,setSearch_results] = useState(false);
  
  // HTML形式に変換
  function convertToHTML(text) {
    let urlPattern = /(^|\s|<.+?>)(https?:\/\/[^\s<>]+)($|\s|<.+?>)/g;
    let extractedText;

    if (/(<\/?[^>]+(>|$)|&nbsp;)/gi.test(text)) {
      // 既にHTMLソースの場合
      extractedText = text.split('”').join('"');
    } else {
      // 普通の文字列の場合
      extractedText = text.replace(/\n/g, '<br />\n');
    }

    extractedText = extractedText.replace(urlPattern, function(match, p1, p2, p3) {
      if (p1.startsWith("<a") || p1.startsWith("<img") || p1.startsWith("<area")) {
        // URLの文字列がa,img,areaのどれかのタグで挟まれていたら、そのままのソースを返す
        return match;
      } else {
        // URLの文字列がその他のHTMLタグかスペースに挟まれていたら、aタグで挟む
        return p1 + "<a href='" + p2 + "'>" + p2 + "</a>" + p3;
      }
    });

    return extractedText;
  }

  const [insertMsg,setInsertMsg] = useState(false);
  
  // 物件挿入
  const proInsert = (item) => {
    
    var msg = item.article_name+"／"+item.layout+"／"+item.category+"\n"+
              item.line_name1+"／"+item.station_name1+"駅／徒歩"+item.station_time1+"分／"+
              item.rent/10000+"万円("+item.general+"円)／"+item.exclusive+"㎡"+"\n\n"+
              "https://www.t-up.systems/show/"+route.customer+"/1/"+item.article_id+"/"+"\n";

    if (mail_format == '1') {
      // HTMLエディタのカーソル位置に挿入
      msg = convertToHTML(msg);
      
      if (inputCursorPosition != null) {
        var index = msgtext.indexOf(inputCursorPosition);
        if (index != -1) {
          msg = '\n' + '<div>' + msg + '</div>';
          proMsg = msgtext.slice(0, index + inputCursorPosition.length) + msg + msgtext.slice(index + inputCursorPosition.length);
        } else {
          proMsg = msgtext + msg;
        }
      } else {
        proMsg = msg + msgtext;
      }
    } else if (mail_format == '0') {
      // TextInputのカーソル位置に挿入
      if (inputCursorPosition != null) {
        proMsg = msgtext.slice(0, inputCursorPosition.start) + msg + msgtext.slice(inputCursorPosition.end);
      } else {
        proMsg = msgtext + msg;
      }
    } else {
      // トーク画面
      proMsg = msgtext + msg;
    }
    
    setInsertMsg(msgtext?proMsg:msg);
  }
  
  useEffect(() => {
    if(props.setMsgtext) {
      props.setMsgtext(insertMsg);
    } else if (props.setNote) {
      props.setNote(insertMsg);
      if (mail_format == '1' && insertMsg) {
        editorRef.current.setContentHTML(insertMsg);
      }
    }
  },[insertMsg])
  
  
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['up']}
      onSwipeComplete={onSwipeComplete}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      propagateSwipe={true}
      onBackdropPress={onClose}
    >
      <View  style={[{height:400},styles.template]}>
        <TouchableOpacity
          style={styles.close}
          onPress={onClose}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <Text style={styles.templateText}>
          指定されている条件でおすすめ物件が表示されます。{"\n"}
          [挿入]ボタンをクリックすると文中に挿入されます。
        </Text>
        <TouchableOpacity style={styles.searchBtn} onPress={recommended}>
          <Text>オススメ物件を探す</Text>
        </TouchableOpacity>
        <Modal
          isVisible={isRecommended}
          backdropOpacity={0.5}
          animationInTiming={300}
          animationOutTiming={500}
          animationIn={'slideInDown'}
          animationOut={'slideOutUp'}
          onBackdropPress={recommended}
        >
          <View style={[{height:600},styles.modalInner]}>
            <TouchableOpacity
              style={styles.close}
              onPress={recommended}
            >
              <Feather name='x-circle' color='gray' size={35} />
            </TouchableOpacity>
              <View style={styles.form}>
                <ScrollView 
                  style={{height:400}}
                >
                <View>
                  <View style={styles.input}>
                    <Text style={styles.label}>物件名</Text>
                    <TextInput
                      onChangeText={(text) => {setArticle_name(text)}}
                      value={article_name}
                      style={styles.inputInner}
                    />
                  </View>
                    <Text style={styles.label}>賃料</Text>
                    <View style={[{flexDirection: 'row'},Platform.OS === 'ios'?{zIndex:1000}:'']}>
                      <DropDownPicker
                        placeholder="------------"
                        style={styles.inputInner}
                        containerStyle={{width:'43%'}}
                        open={open_rent_from}
                        value={value_rent_from}
                        items={rent_from}
                        setOpen={setOpen_Rent_from}
                        setValue={setValue_Rent_from}
                        setItems={setRent_from}
                        zIndex={1000}
                        listMode={"SCROLLVIEW"}
                      />
                      <Text style={{marginTop:15}}>　～　</Text>
                      <DropDownPicker
                        placeholder="------------"
                        style={styles.inputInner}
                        containerStyle={{width:'43%'}}
                        open={open_rent_to}
                        value={value_rent_to}
                        items={rent_to}
                        setOpen={setOpen_Rent_to}
                        setValue={setValue_Rent_to}
                        setItems={setRent_to}
                        zIndex={999}
                        listMode={"SCROLLVIEW"}
                      />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <View style={{width:'50%'}}>
                        <CheckBox
                          title='管理費込み'
                          checked={general}
                          onPress={() => setGeneral(!general)}
                          containerStyle={{marginLeft:0}}
                        />
                      </View>
                      <View style={{width:'50%'}}>
                        <CheckBox
                          title='敷金礼金なし'
                          checked={deposit}
                          onPress={() => setDeposit(!deposit)}
                          containerStyle={{marginLeft:0}}
                        />
                      </View>
                    </View>
                    <Text style={styles.label}>間取り
                    <Text style={styles.inlabel}>　※複数選択可</Text></Text>
                    <DropDownPicker
                      placeholder="------------"
                      dropDownContainerStyle={{height:150}}
                      multiple={true}
                      open={open_layout}
                      value={value_layout}
                      items={layout}
                      setOpen={setOpen_layout}
                      setValue={setValue_layout}
                      setItems={setLayout}
                      zIndex={998}
                      listMode={"SCROLLVIEW"}
                      translation={{ SELECTED_ITEMS_COUNT_TEXT:"{count}"}}
                    />
                  <View style={[styles.input,{zIndex:997}]}>
                    <Text style={styles.label}>沿線・駅名
                    <Text style={styles.inlabel}>　※検索語句を入力してください</Text></Text>
                    <Autocomplete
                      data={filteredStations}
                      onChangeText={(text) => findStation(text)}
                      style={styles.inputInner}
                      inputContainerStyle={{borderWidth:0}}
                      flatListProps={{
                        keyExtractor: (item) => `${item.id}`,
                        renderItem: ({ item }) => 
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedStations((prevArray)=>[...prevArray, item]);
                            setFilteredStations([]);
                          }}>
                          <Text style={styles.suggestText}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>,
                      }}
                    />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <FlatList 
                      data={selectedStations}
                      renderItem={({ item }) => 
                        (
                          <MaterialChip
                            text={item.name}
                            onPress={() => station_delete(item)}
                            rightIcon={
                              <Feather name='x-circle' color='gray' size={18} />
                            }
                          />
                        )
                      }
                      keyExtractor={(item) => `${item.id}`}
                    />
                  </View>
                  <View style={styles.input}>
                    <Text style={styles.label}>徒歩分数</Text>
                    <TextInput
                      onChangeText={(text) => {setStation_time(text)}}
                      value={station_time}
                      style={styles.inputInner}
                    />
                  </View>
                  <View style={[styles.input,{zIndex:996}]}>
                    <Text style={styles.label}>エリア名
                    <Text style={styles.inlabel}>　※検索語句を入力してください</Text></Text>
                    <Autocomplete
                      data={filteredAddress}
                      onChangeText={(text) => findAddress(text)}
                      style={styles.inputInner}
                      inputContainerStyle={{borderWidth:0}}
                      flatListProps={{
                        keyExtractor: (item) => `${item.id}`,
                        renderItem: ({ item }) => 
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedAddress((prevArray)=>[...prevArray, item]);
                            setFilteredAddress([]);
                          }}>
                          <Text style={styles.suggestText}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>,
                      }}
                    />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <FlatList 
                      data={selectedAddress}
                      renderItem={({ item }) => 
                        (
                          <MaterialChip
                            text={item.name}
                            onPress={() => area_delete(item)}
                            rightIcon={
                              <Feather name='x-circle' color='gray' size={18} />
                            }
                          />
                        )
                      }
                      keyExtractor={(item) => `${item.id}`}
                    />
                  </View>
                  <View style={[styles.input,{zIndex:995}]}>
                    <Text style={styles.label}>面積</Text>
                    <View style={[{flexDirection: 'row'},Platform.OS === 'ios'?{zIndex:997}:'']}>
                      <DropDownPicker
                        placeholder="------------"
                        style={styles.inputInner}
                        dropDownContainerStyle={{height:100}}
                        containerStyle={{width:'43%'}}
                        open={open_exclusive_from}
                        value={value_exclusive_from}
                        items={exclusive_from}
                        setOpen={setOpen_Exclusive_from}
                        setValue={setValue_Exclusive_from}
                        setItems={setExclusive_from}
                        zIndex={995}
                        listMode={"SCROLLVIEW"}
                      />
                      <Text style={{marginTop:15}}>　～　</Text>
                      <DropDownPicker
                        placeholder="------------"
                        style={styles.inputInner}
                        dropDownContainerStyle={{height:100}}
                        containerStyle={{width:'43%'}}
                        open={open_exclusive_to}
                        value={value_exclusive_to}
                        items={exclusive_to}
                        setOpen={setOpen_Exclusive_to}
                        setValue={setValue_Exclusive_to}
                        setItems={setExclusive_to}
                        zIndex={994}
                        listMode={"SCROLLVIEW"}
                      />
                    </View>
                    <CheckBox
                      center
                      title='詳細'
                      containerStyle={[detail === true?'':{marginBottom:35},{marginTop:20}]}
                      checked={detail}
                      onPress={() => setDetail(!detail)}
                    />
                  </View>
                  <View style={detail === true?'':{display:'none'}}>
                    <View style={styles.input}>
                      <Text style={styles.label}>物件番号</Text>
                      <TextInput
                        onChangeText={(text) => {setArticle_id(text)}}
                        value={article_id}
                        style={styles.inputInner}
                      />
                    </View>
                    <View style={[styles.input,Platform.OS === 'ios'?{zIndex:993}:'']}>
                      <Text style={styles.label}>物件種別
                      <Text style={styles.inlabel}>　※複数選択可</Text></Text>
                      <DropDownPicker
                        placeholder="------------"
                        multiple={true}
                        style={styles.inputInner}
                        open={open_category}
                        value={value_category}
                        items={category}
                        setOpen={setOpen_Category}
                        setValue={setValue_Category}
                        setItems={setCategory}
                        zIndex={993}
                        listMode={"SCROLLVIEW"}
                        translation={{ SELECTED_ITEMS_COUNT_TEXT:"{count}"}}
                      />
                    </View>
                    <View style={[styles.input,Platform.OS === 'ios'?{zIndex:992}:'']}>
                      <Text style={styles.label}>建物構造
                      <Text style={styles.inlabel}>　※複数選択可</Text></Text>
                      <DropDownPicker
                        placeholder="------------"
                        multiple={true}
                        style={styles.inputInner}
                        open={open_constructure}
                        value={value_constructure}
                        items={constructure}
                        setOpen={setOpen_Constructure}
                        setValue={setValue_Constructure}
                        setItems={setConstructure}
                        zIndex={992}
                        listMode={"SCROLLVIEW"}
                        translation={{ SELECTED_ITEMS_COUNT_TEXT:"{count}"}}
                      />
                    </View>
                    <View style={[styles.input,Platform.OS === 'ios'?{zIndex:991}:'']}>
                      <Text style={styles.label}>築年数</Text>
                      <DropDownPicker
                        placeholder="------------"
                        style={styles.inputInner}
                        open={open_built}
                        value={value_built}
                        items={built}
                        setOpen={setOpen_Built}
                        setValue={setValue_Built}
                        setItems={setBuilt}
                        zIndex={991}
                        listMode={"SCROLLVIEW"}
                      />
                      <Text style={styles.inlabel}>※新築は築1年以内の物件が絞り込まれます</Text>
                    </View>
                    <View style={[styles.input,Platform.OS === 'ios'?{zIndex:990}:'']}>
                      <Text style={styles.label}>条件・設備
                      <Text style={styles.inlabel}>　※複数選択可</Text></Text>
                      <DropDownPicker
                        placeholder="------------"
                        multiple={true}
                        categorySelectable={false}
                        style={styles.inputInner}
                        open={open_setubi}
                        value={value_setubi}
                        items={setubi}
                        setOpen={setOpen_Setubi}
                        setValue={setValue_Setubi}
                        setItems={setSetubi}
                        zIndex={990}
                        listMode={"SCROLLVIEW"}
                        translation={{ SELECTED_ITEMS_COUNT_TEXT:"{count}"}}
                      />
                    </View>
                    <View style={[{flexDirection: 'row',alignItems: 'center'},Platform.OS === 'ios'?{zIndex:889}:'']}>
                      <Text style={[styles.label,{width:'20%'}]}>コンロ：</Text>
                      <DropDownPicker
                        placeholder="------------"
                        style={[styles.inputInner,{width:'78%'}]}
                        open={open_stove}
                        value={value_stove}
                        items={stove}
                        setOpen={setOpen_Stove}
                        setValue={setValue_Stove}
                        setItems={setStove}
                        zIndex={889}
                        listMode={"SCROLLVIEW"}
                      />
                    </View>
                    <View
                      style={[
                        styles.input,
                        open_direction || open_setubi || open_stove === true?{marginBottom:120}:'',
                        Platform.OS === 'ios'?{zIndex:888}:''
                      ]}>
                      <Text style={styles.label}>主要採光面
                      <Text style={styles.inlabel}>　※複数選択可</Text></Text>
                      <DropDownPicker
                        placeholder="------------"
                        multiple={true}
                        dropDownContainerStyle={{height:120,zIndex:888}}
                        style={styles.inputInner}
                        open={open_direction}
                        value={value_direction}
                        items={direction}
                        setOpen={setOpen_Direction}
                        setValue={setValue_Direction}
                        setItems={setDirection}
                        zIndex={888}
                        listMode={"SCROLLVIEW"}
                        translation={{ SELECTED_ITEMS_COUNT_TEXT:"{count}"}}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              <CheckBox
                center
                title='条件を保存する'
                checked={save}
                onPress={() => setSave(!save)}
              />
              <View style={{flexDirection: 'row',alignSelf: 'center'}}>
                <TouchableOpacity onPress={onDelete} style={[styles.draft,{marginTop:0}]}>
                  <Text>リセット</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSubmit} style={[styles.submit,{marginTop:0}]}>
                  <Text style={styles.submitText}>検　索</Text>
                </TouchableOpacity>
              </View>
              </View>
          </View>
        </Modal>
        <FlatList 
          horizontal
          data={search_results?search_results:property}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.property}
            >
              <View style={styles.propertyInner}>
                <Text style={styles.propertyTitle}>{item.article_name}{"\n"}
                <Text style={{fontSize:12}}>{item.floor}階</Text></Text>
                <View style={styles.propertyInfo}>
                  <Text>沿線：</Text><Text>{item.line_name1}</Text>
                </View>
                <View style={styles.propertyInfo}>
                  <Text>駅名：</Text><Text>{item.station_name1}駅</Text>
                </View>
                <View style={styles.propertyInfo}>
                  <Image
                    style={styles.propertyPhoto}
                    source={{
                      uri: item.img_gaikan,
                    }}
                  />
                  <View>
                    <Text><Text style={{color:'red'}}>{item.rent/10000}</Text>万({item.general}円)</Text>
                    <Text>徒歩{item.station_time1}分</Text>
                    <Text>{item.layout}/{item.category}</Text>
                    <Text>{item.exclusive}㎡</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.propertyInner}
                  onPress={() => proInsert(item)}
                >
                  <Image
                    source={require('../../assets/btn_app.png')}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `${item.article_id}`}
        />
      </View>
    </Modal>
  );
}

export function MyModal4(props){
  
  const { isVisible,onSwipeComplete,onPress,fixed,msgtext,subject,hensu,mail_format,editorRef } = props;

  const [fixed_category, setFixed_Category] = useState([]);
  
  useEffect(() => {
    // カテゴリーの重複を検出したものを重複しないでリスト
    const f_c = fixed.map((c) =>{
      return c.category
    })
    setFixed_Category(Array.from(new Set(f_c)));
  }, [fixed]);
  
  const [chatbot,setChatbot] = useState([]);
  
  useEffect(() => {
    if(hensu!=[]) {
      setChatbot(hensu[8])
    }
  }, [hensu])
  
  // カテゴリ内をリスト化
  function list(category) {
    
    const l = fixed.map((f) => {
      if (category == f.category) {
        return (
          <TouchableOpacity onPress={() => tmp_send(f)} key={f.fixed_id}>
            <Text style={styles.CollapseBodyText}>{f.title}</Text>
          </TouchableOpacity>
        )
      }
    })
    
    return l;
  }
  
  // HTML形式に変換
  function convertToHTML(text) {
    let urlPattern = /(^|\s|<.+?>)(https?:\/\/[^\s<>]+)($|\s|<.+?>)/g;
    let extractedText;

    if (/(<\/?[^>]+(>|$)|&nbsp;)/gi.test(text)) {
      // 既にHTMLソースの場合
      extractedText = text.split('”').join('"');
    } else {
      // 普通の文字列の場合
      extractedText = text.replace(/\n/g, '<br />\n');
    }

    extractedText = extractedText.replace(urlPattern, function(match, p1, p2, p3) {
      if (p1.startsWith("<a") || p1.startsWith("<img") || p1.startsWith("<area")) {
        // URLの文字列がa,img,areaのどれかのタグで挟まれていたら、そのままのソースを返す
        return match;
      } else {
        // URLの文字列がその他のHTMLタグかスペースに挟まれていたら、aタグで挟む
        return p1 + "<a href='" + p2 + "'>" + p2 + "</a>" + p3;
      }
    });

    return extractedText;
  }
  
  // 書き換え
  function tmp_send(fixed_data){
    
    let title = fixed_data.mail_title;
    
    title = title.split("%お客様名%");
    title = title.join(hensu[0]);
    title = title.split("%会社名%");
    title = title.join(hensu[1]);
    title = title.split("%店舗名%");
    title = title.join(hensu[2]);
    title = title.split("%担当名%");
    title = title.join(hensu[3]);
    title = title.split("%入力者名%");
    title = title.join(hensu[4]);
    title = title.split("%お問い合わせ媒体%");
    title = title.join(hensu[5]);
    title = title.split("%お問い合わせ物件%");
    if (hensu[6]) {
      let bukken = '';
      for (let i = 0; i < hensu[6].length; i++) {
        bukken += hensu[6][i];
        bukken += '\n';
      }
      title = title.join(bukken);
    }else{
      title = title.join('');
    }
    title = title.split("%お問い合わせ物件URL%");
    title = title.join(hensu[7]?hensu[7]:'');
    
    if (chatbot.length > 1){
      for (let i = 0; i < chatbot.length; i++) {
        title = title.split("%チャットボット"+(i+1)+"%");
        title = title.join(chatbot[i]);
      }
    }
    
    let note = fixed_data.note;
    
    note = note.split("%お客様名%");
    note = note.join(hensu[0]);
    note = note.split("%会社名%");
    note = note.join(hensu[1]);
    note = note.split("%店舗名%");
    note = note.join(hensu[2]);
    note = note.split("%担当名%");
    note = note.join(hensu[3]);
    note = note.split("%入力者名%");
    note = note.join(hensu[4]);
    note = note.split("%お問い合わせ媒体%");
    note = note.join(hensu[5]);
    note = note.split("%お問い合わせ物件%");
    if (hensu[6]) {
      let bukken = '';
      for (let i = 0; i < hensu[6].length; i++) {
        bukken += hensu[6][i];
        bukken += '\n';
      }
      note = note.join(bukken);
    }else{
      note = note.join('');
    }
    note = note.split("%お問い合わせ物件URL%");
    note = note.join(hensu[7]?hensu[7]:'');
    
    if (chatbot.length > 1){
      for (let i = 0; i < chatbot.length; i++) {
        note = note.split("%チャットボット"+(i+1)+"%");
        note = note.join(chatbot[i]);
      }
    }
    
    if (mail_format == '1') {
      note = convertToHTML(note);
    }
    
    if(msgtext || subject || props.setNote || props.setMail_subject) {
      Alert.alert(
        "入力されている【件名】と【本文】が削除されますがよろしいですか？",
        "",
        [
          {
            text: "はい",
            onPress: () => {
              if(props.setMsgtext && props.setSubject) {
                props.setMsgtext(note);
                props.setSubject(title);
              } else if (props.setNote && props.setMail_subject) {
                props.setNote(note);
                props.setMail_subject(title);
                if (mail_format == '1') {
                  editorRef.current.setContentHTML(note);
                }
              }
              
              if (props.setFixed) {
                props.setFixed(false);
              }
            }
          },
          {
            text: "いいえ",
          },
        ]
      );
    } else {
      if(props.setMsgtext && props.setSubject) {
        props.setMsgtext(note);
        props.setSubject(title);
      } else if (props.setNote && props.setMail_subject) {
        props.setNote(note);
        props.setMail_subject(title);
      }
      
      if (props.setFixed) {
        props.setFixed(false);
      }
    }
    
  }
  
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['up']}
      onSwipeComplete={onSwipeComplete}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      propagateSwipe={true}
      onBackdropPress={onPress}
    >
      <View  style={[{height:300},styles.template]}>
        <TouchableOpacity
          style={styles.close}
          onPress={onPress}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <Text style={styles.templateText}>
          定型文をクリックすると送信内容に反映されます。{"\n"}
          先にテキストを入力している状態で、定型文を選択すると内容が上書きされます。{"\n"}
          ご注意ください。
        </Text>
        <FlatList 
          data={fixed_category}
          renderItem={({ item }) => 
            (
              <Collapse>
                <CollapseHeader>
                  <View>
                    <Text style={styles.CollapseHeader}>{item}</Text>
                  </View>
                </CollapseHeader>
                <CollapseBody>
                  <View>
                    {list(item)}
                  </View>
                </CollapseBody>
              </Collapse>
            )
          }
        />
      </View>
    </Modal>
  );
}

export function MyModal5(props){
  
  const { isVisible,tantou,route,staff,navigation,cus,overlap } = props;
  
  const [pattern,setPattern] = useState('');
  const [close,setClose] = useState(false);
  const [open, setOpen] = useState(false);
  const [staff_value, setStaff_Value] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const items = staffs.map((item) => {
    return ({
      label: item.name_1+'　'+(item.name_2?item.name_2:''),
      value: item.account,
      key: item.account
    });
  });
  
  const [name,setName] = useState('');
  const [tel,setTel] = useState('');
  const [mail,setMail] = useState('');
  const [suumo,setSuumo] = useState(false);
  const [title,setTitle] = useState('');
  const [note,setNote] = useState('');
  
  const [modal7, setModal7] = useState(false);
  
  useEffect(() => {
    
    setStaffs(staff);
    setClose(isVisible);
    
    staff.map((s) => {
      if (route.params.account == s.account) {
        setStaff_Value(s.account)
      }
    })
    
    if (cus) {
      
      setName(cus.main.name);
      
      if (cus.reverberation.media == 'SUUMO' && !cus.main.tel1 && !cus.main.tel2 && (cus.main.tel3).substring(0,3) == '050') {
        setTel(cus.main.tel3);
        setSuumo(true);
      } else {
        setTel(cus.main.tel1);
      }
      
      setMail(cus.main.mail1);
      
      setTitle(cus.beginning_communication.title);
      setNote(cus.beginning_communication.note);
      
      if (cus.reverberation.media == 'スマイティ' || cus.reverberation.media == 'ホームメイト' || !cus.main.name) {
        setPattern(2);
      } else {
        setPattern(1);
      }
      
    }
    
  }, [staff,isVisible,cus])
  
  function setView(cus,pattern) {
    
    if (overlap) {
      if (pattern == 1) {
        return (
          <ScrollView style={overlap.group?{height:240}:{height:280}}>
            <Text style={styles.cus_label}>【氏名】</Text>
            <Text style={styles.cus_contents}>
              {name}
            </Text>
            <Text style={styles.cus_label}>【電話番号】</Text>
            <Text style={styles.cus_contents}>
              {tel}
            </Text>
            <Text style={suumo?[styles.cus_contents,{color:'red'}]:{display:'none'}}>
              ※こちらは有効期限付きの番号です。{"\n"}お客様の電話番号のご確認をお願いします
            </Text>
            <Text style={styles.cus_label}>【件名】</Text>
            <Text style={styles.cus_contents}>
              {title}
            </Text>
            <Text style={styles.cus_label}>【本文】</Text>
            <Text style={styles.cus_contents}>
              {note}
            </Text>
          </ScrollView>
        )
      } else if (pattern == 2) {
        
        return (
          <ScrollView style={overlap.group?{height:240}:{height:280}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.cus_label}>【氏名】</Text>
              <Text style={[styles.cus_label,{color:'red'}]}>※必須</Text>
            </View>
            <TextInput
              onChangeText={(text) => {setName(text)}}
              value={name}
              style={[styles.inputInner,{marginVertical:10}]}
            />
              <Text style={{color:'red',marginBottom:5}}>※電話番号かメールアドレスのいずれか必須</Text>
            <Text style={styles.cus_label}>【電話番号】</Text>
            <TextInput
              onChangeText={(text) => {setTel(text)}}
              value={tel}
              style={[styles.inputInner,{marginTop:10}]}
            />
            <Text style={suumo?[styles.cus_contents,{color:'red'}]:{display:'none'}}>
              ※こちらは有効期限付きの番号です。{"\n"}お客様の電話番号のご確認をお願いします
            </Text>
            <Text style={styles.cus_label}>【メールアドレス】</Text>
            <TextInput
              onChangeText={(text) => {setMail(text)}}
              value={mail}
              style={[styles.inputInner,{marginVertical:10}]}
            />
            <Text style={styles.cus_label}>【件名】</Text>
            <Text style={styles.cus_contents}>
              {title}
            </Text>
            <Text style={styles.cus_label}>【本文】</Text>
            <Text style={styles.cus_contents}>
              {note}
            </Text>
          </ScrollView>
        )
      }
    }
  }
  
  function onSubmit(){
    
    if (pattern == 2) {
      if (!name) {
        Alert.alert('氏名は必須です');
        return
      }
      
      if (!tel && !mail) {
        Alert.alert('電話番号かメールアドレスのいずれかを入力してください')
        return
      }
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
        shop_id:route.params.shop_id,
        act:'linker',
        customer_id:route.customer,
        tantou:tantou,
        user_id:staff_value,
        val_flg:pattern,
        name:name,
        tel:tel,
        mail:mail,
      })
    })
      .then((response) => response.json())
      .then((json) => {
        Alert.alert('設定しました');
        setClose(false)
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory' ,
            params: route.params,
            websocket:route.websocket,
            station:route.station,
            address:route.address,
          }],
        });
      })
      .catch((error) => {
        Alert.alert('設定に失敗しました{"\n"}PCから設定してください');
        
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory' ,
            params: route.params,
            websocket:route.websocket,
            station:route.station,
            address:route.address,
          }],
        });
      })
    
    
  }
  
  const changeShop = () => {
    setModal7(!modal7);
  }
  
  return (
    <Modal
      isVisible={close}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
    >
      <MyModal7
        isVisible={modal7}
        route={route}
        overlap={overlap}
        cus={cus}
        navigation={navigation}
      />
      <View  style={[{height:500},styles.template]}>
        <TouchableOpacity
          style={styles.close}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{
                name: 'CommunicationHistory' ,
                params: route.params,
                websocket:route.websocket,
                station:route.station,
                address:route.address,
              }],
            });
          }}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <Text style={styles.templateText}>{tantou}担当者が割り振られていません{"\n"}担当者を選択してください</Text>
        <DropDownPicker
          style={[styles.inputInner,{marginTop:20}]}
          containerStyle={{width:'100%'}}
          dropDownContainerStyle={{marginTop:20}}
          open={open}
          value={staff_value}
          items={items}
          setOpen={setOpen}
          setValue={setStaff_Value}
          placeholder = "▼　担当者"
          zIndex={999}
        />
        <View style={{marginTop:10}}>
          {setView(cus,pattern)}
        </View>
        <View style={styles.overlap_btnwrap}>
          <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => setClose(false)} style={styles.draft}>
            <Text>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSubmit} style={[styles.submit]}>
            <Text style={styles.submitText}>確　定</Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={changeShop} style={!overlap?{display:'none'}:overlap.group?[styles.submit,{marginTop:5,width:210}]:{display:'none'}}>
            <Text style={styles.submitText}>他グループ店振替</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function MyModal6(props){
  
  const { isVisible,overlap,route,navigation,staff,tantou,cus } = props;
  
  const [close,setClose] = useState(false);
  const [customer, setCustomer] = useState([]);
  const [name,setName] = useState(false);
  const [title,setTitle] = useState(false);
  const [note,setNote] = useState(false);
  
  const [ol, setOL] = useState(false);
  
  const [id,setID] = useState(false);
  const [customer_id,setCustomer_id] = useState(false);
  const [user_id,setUser_id] = useState(false);
  
  const [text,setText] = useState('')
  const [num,setNum] = useState('')
  
  const [open, setOpen] = useState(false);
  const [staffs, setStaffs] = useState([]);
  
  const [modal5, setModal5] = useState(false);
  const [modal7, setModal7] = useState(false);
  
  useEffect(() => {
    
    setClose(isVisible);
    
    if (overlap && overlap.list) {

      setOL(overlap)
      
      // スタッフ名
      const s = Object.entries(overlap.staff);
      
      setName(overlap.main.name);    // お客様名
      setTitle(overlap.main.title);    // 件名
      setNote(overlap.main.note);    //本文
      
      setCustomer_id(overlap.main.customer_id);
      
      overlap.list.map((val) => {
        setID(val.customer_id)
        setUser_id(val.user_id)
      })
      
      // 重複パターン振り分け
      setNum(overlap.overlap)
      if (overlap.overlap == '1') {    // 重複【既存あり(1件のみ)】
      
        setText(`${s[0][1].name_1+'　'+s[0][1].name_2}`+'さんが担当している\nお客様：'+`${overlap.list[0].name}`+'さんと連絡先が同一です。\nこのお客様にまとめますか？')
        
      } else if (overlap.overlap == '2') {    // 重複【既存あり(1件以上)】
        setText('下記お客様たちと同一の連絡先をもっています。\nどれかのお客様にまとめますか？')
      } else if (overlap.overlap == '3') {    // 重複【新規に既存有り】
      
        setText('下記反響は同じ連絡先を持っています。\n一人のお客様としてまとめますか？')
        
        let id_list = '';
        let id_list_min = '';
        
        overlap.list.map((cus) => {
          
          // customer_id
          if(id_list){
            id_list += ","+cus.customer_id;
          } else {
            id_list = cus.customer_id;
          }
          
          // customer_id古いもの取得処理
          if(!id_list_min){
            // 初回処理
            id_list_min = cus.customer_id;
          } else if (parseInt(id_list_min) >= parseInt(cus.customer_id)){
            // 登録してるものより古かった場合
            id_list_min = cus.customer_id;
          }
        })
        
        setID(id_list_min);
        setCustomer_id(id_list);
        
        const items = s.map((item) => {
          
          if (route.params.account == item[0]) {
            setUser_id(item[0]);
          }
          
          return ({
            label: item[1].name_1+'　'+item[1].name_2,
            value: item[0],
          });
        });
        
        setStaffs(items);
      }
      
    }
    
  }, [overlap,isVisible])
  
  function setView(num,overlap){
    
    if (!overlap.list) {
      return
    }
    
    if (overlap) {
      if (num == '1') {
        return (
          <ScrollView style={overlap.group?{height:240}:{height:280}}>
            <Text style={styles.cus_label}>【氏名】</Text>
            <Text style={styles.cus_contents}>
              {overlap.main.name}
            </Text>
            <Text style={styles.cus_label}>【件名】</Text>
            <Text style={styles.cus_contents}>
              {overlap.main.title}
            </Text>
            <Text style={styles.cus_label}>【メール本文】</Text>
            <Text style={styles.cus_contents}>
              {overlap.main.note}
            </Text>
          </ScrollView>
        )
      } else if (num == '2') {
        
        // スタッフ名
        const s = Object.entries(overlap.staff);
        
        const data = overlap.list.map((cus) => {
          
          return ({
            label: '【担当者】'+s[0][1].name_1+'　'+s[0][1].name_2+'\n【お客様名】'+cus.name+'\n【問い合わせ日】'+(cus.inquiry_day?cus.inquiry_day:'')+'\n【来店日】'+(cus.coming_day1?cus.coming_day1:''),
            value: {
              id:cus.customer_id,
              customer_id:customer_id,
              user_id:cus.user_id
            },
          })
        })
        
        return (
          <ScrollView style={overlap.group?{height:240}:{height:280}}>
            <RadioButtonRN
              data={data}
              value={customer_id}
              selectedBtn={(e) => {
                setID(e.value.id);
                setCustomer_id(e.value.customer_id);
                setUser_id(e.value.user_id);
              }}
              animationTypes={['rotate']}
              activeColor={'#191970'}
              initial={1}
            />
          </ScrollView>
        )
        
      } else if (num == '3') {
        
        return (
          <>
          <DropDownPicker
            style={[styles.DropDown,{marginBottom:5}]}
            dropDownContainerStyle={styles.dropDownContainer}
            open={open}
            value={user_id}
            items={staffs}
            setOpen={setOpen}
            setValue={setUser_id}
            placeholder = "▼　担当者"
            zIndex={999}
          />
          <FlatList
            style={overlap.group?{height:200}:{height:240}}
            data={overlap.list}
            renderItem={({ item }) => {
              return (
                <View style={styles.overlap3}>
                  <Text>【氏名】
                    {item.name?(item.name.length < 15
                      ?item.name
                      :item.name.substring(0, 15)+'...'
                    ):''}
                  </Text>
                  <Text>【件名】
                    {item.title?(item.title.length < 15
                      ?item.title
                      :item.title.substring(0, 15)+'...'
                    ):''}
                  </Text>
                  <Text>【メール本文】{"\n"}
                    {item.note?(item.note.length < 40
                      ?item.note
                      :item.note.substring(0, 40)+'...'
                    ):''}
                  </Text>
                </View>
              )
            }}
          />
          </>
        )
      }
    }
  }
  
  function onSubmit(){
    
    let formData = new FormData();
    formData.append('ID',route.params.account);
    formData.append('pass',route.params.password);
    formData.append('act','register_all');
    formData.append('val[app_flg]',1);
    formData.append('val[id]',id,);
    formData.append('val[customer_id]',customer_id);
    formData.append('val[shop_id]',route.params.shop_id);
    formData.append('val[user_id]',user_id);
    formData.append('val[flg]',1);
    formData.append('val[user_flg]',num=='2'?'':1);
    formData.append('val[not_teply_flg]',1);
    
    fetch(domain+'php/ajax/update.php',
    {
      method: 'POST',
      body: formData,
      header: {
        'content-type': 'multipart/form-data',
      },
    })
    .then((response) => response.json())
    .then((json) => {
      if (json) {
        
        // ローカルDBから削除
        db.transaction((tx) => {
          tx.executeSql(
            `delete from customer_mst where customer_id in ("`+customer_id+`") and customer_id != "`+user_id+`";`,
            [],
            // 成功時のコールバック関数
            (_, { rows }) => {
              console.log("重複削除成功");
            },
            () => {
              // 失敗時のコールバック関数
              console.log("重複削除失敗");
            }
          )
        })
        
        Alert.alert('反響振分しました。')
        setClose(false)
        
        // お客様一覧に戻る
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory' ,
            params: route.params,
            websocket:route.websocket,
            station:route.station,
            address:route.address,
          }],
        });
      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('失敗');
    })
    
  }
  
  function onTransfer() {
    
  }
  
  const noSubmit = () => {
    setModal5(!modal5);
  }
  
  const changeShop = () => {
    setModal7(!modal7);
  }
  
  return (
    <Modal
      isVisible={close}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
    >
      <MyModal5
        isVisible={modal5}
        route={route}
        staff={staff}
        navigation={navigation}
        tantou={tantou}
        cus={cus}
        overlap={overlap}
      />
      <MyModal7
        isVisible={modal7}
        route={route}
        overlap={overlap}
        cus={cus}
        navigation={navigation}
      />
      <View  style={[{height:430},styles.template]}>
        <TouchableOpacity
          style={styles.close}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{
                name: 'CommunicationHistory' ,
                params: route.params,
                websocket:route.websocket,
                station:route.station,
                address:route.address,
              }],
            });
          }}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <Text style={styles.templateText}>{text}</Text>
        <View style={{marginTop:10}}>
          {setView(num,ol)}
        </View>
        <View style={styles.overlap_btnwrap}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={noSubmit} style={styles.draft}>
              <Text>まとめない</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSubmit} style={styles.submit}>
              <Text style={styles.submitText}>まとめる</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={changeShop} style={!overlap?{display:'none'}:overlap.group?[styles.submit,{marginTop:5,width:210}]:{display:'none'}}>
            <Text style={styles.submitText}>他グループ店振替</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function MyModal7(props){
  
  const { isVisible,overlap,route,cus,navigation } = props;
  
  const [close,setClose] = useState(false);
  const [customer_id, setCustomer_id] = useState([]);
  const [name,setName] = useState(false);
  const [title,setTitle] = useState(false);
  const [note,setNote] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [shop_value, setShop_Value] = useState(false);
  
  useEffect(() => {
    
    setClose(isVisible);
    
    if (overlap && overlap.group) {
      
      setName(overlap.main.name);    // お客様名
      setTitle(overlap.main.title);    // 件名
      setNote(overlap.main.note);    //本文
      
      setCustomer_id(overlap.main.customer_id);
      
      // 他店舗
      const items = overlap.group.map((item) => {
        
        if (item.shop_id != route.params.shop_id) {
          return ({
            label: item.name,
            value: item.shop_id,
          });
        }
        
      }).filter(item => item);
      
      setShop_Value(items[0].value)
      setShops(items)
    }
    
  }, [overlap,isVisible])
  
  function onSubmit() {
    
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
        act:'transfer_data',
        customer_id:route.customer,
        customer_id:customer_id,
        shop_id:route.params.shop_id,
        transfer_shop_id:shop_value,
      })
    })
      .then((response) => response.json())
      .then((json) => {
        if (json) {
          // ローカルDBから削除
          db.transaction((tx) => {
            tx.executeSql(
              `delete from customer_mst where (customer_id = ?)`,
              [customer_id],
              // 成功時のコールバック関数
              (_, { rows }) => {
                console.log("振分削除成功");
              },
              () => {
                // 失敗時のコールバック関数
                console.log("振分削除失敗");
              }
            )
          })
          
          Alert.alert('振分しました');
          setClose(false)
          navigation.reset({
            index: 0,
            routes: [{
              name: 'CommunicationHistory' ,
              params: route.params,
              websocket:route.websocket,
              station:route.station,
              address:route.address,
            }],
          });
        }
      })
      .catch((error) => {
        Alert.alert('他グループ店振分に失敗しました\nPCから設定してください');
        
        navigation.reset({
          index: 0,
          routes: [{
            name: 'CommunicationHistory' ,
            params: route.params,
            websocket:route.websocket,
            station:route.station,
            address:route.address,
          }],
        });
      })
  }
  
  return (
    
    <Modal
      isVisible={close}
      backdropOpacity={0}
      animationInTiming={300}
      animationOutTiming={500}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
    >
      <View  style={[{height:500},styles.template]}>
        <TouchableOpacity
          style={styles.close}
          onPress={() => setClose(false)}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <Text style={styles.templateText}>他グループ店振分</Text>
        <View style={{marginTop:15}}>
          <ScrollView style={{height:300}}>
            <Text style={styles.cus_label}>【氏名】</Text>
            <Text style={styles.cus_contents}>
              {name}
            </Text>
            <Text style={styles.cus_label}>【件名】</Text>
            <Text style={styles.cus_contents}>
              {title}
            </Text>
            <Text style={styles.cus_label}>【メール本文】</Text>
            <Text style={styles.cus_contents}>
              {note}
            </Text>
          </ScrollView>
        </View>
        <Text style={[styles.cus_label,{marginTop:5}]}>【グループ店舗】</Text>
        <DropDownPicker
          style={[styles.inputInner,{marginTop:5}]}
          containerStyle={{width:'100%'}}
          open={open}
          value={shop_value}
          items={shops}
          setOpen={setOpen}
          setValue={setShop_Value}
          placeholder = "▼　担当者"
          zIndex={999}
        />
        <View style={[styles.overlap_btnwrap,{flexDirection: 'row'}]}>
          <TouchableOpacity onPress={() => setClose(false)} style={styles.draft}>
            <Text>戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSubmit} style={[styles.submit]}>
            <Text style={styles.submitText}>確　定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
  
}

export function MyModal8(props){
  
  const { isVisible, openTextColor, setTextColor, textColor } = props;
  
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={openTextColor}
    >
      <View style={styles.modalInner}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top:8,
            right:10,
            zIndex:1000
          }}
          onPress={openTextColor}
        >
          <Feather name='x-circle' color='gray' size={35} />
        </TouchableOpacity>
        <ColorPicker
          color={textColor}
          onColorChangeComplete={(color) => {setTextColor(color)}}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalInner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#ffffff",
    width:'100%',
  },
  form: {
    width: "90%",
  },
  input: {
    marginBottom: 5,
    width:'100%',
  },
  label: {
    marginTop: 10,
    marginBottom:5,
    marginLeft:5,
    fontSize:16,
  },
  inlabel: {
    color:'#bbbbbb',
    fontSize:12,
  },
  inputInner: {
    height:45,
    paddingVertical:10,
    paddingHorizontal:5,
    borderColor: '#1f2d53',
    fontSize:16,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  textarea: {
    height:200,
    paddingVertical:10,
    paddingHorizontal:5,
    borderColor: '#1f2d53',
    fontSize:16,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlignVertical: 'top'
  },
  file:{
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:5,
    borderRadius: 8,
    width:100,
    height:40,
    borderWidth:1,
    borderColor:'#1f2d53',
    marginRight:10,
  },
  draft:{
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop:10,
    borderRadius: 8,
    width:100,
    height:40,
    borderWidth:1,
    borderColor:'#1f2d53',
    marginRight:10,
  },
  submit:{
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop:10,
    borderRadius: 8,
    width:100,
    height:40,
    backgroundColor:'#1f2d53',
  },
  submitText: {
    fontSize:16,
    color:'#ffffff'
  },
  delete:{
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:5,
    borderRadius: 8,
    width:100,
    height:40,
    borderWidth:1,
    borderColor:'#1f2d53',
  },
  deleteText: {
    fontSize:16,
    color:'#1f2d53'
  },
  searchBtn:{
    justifyContent: 'center',
    alignItems: 'center',
    width:180,
    height:30,
    marginVertical:10,
    borderWidth:1,
    borderColor:'#000000',
    borderRadius: 8,
  },
  property: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#000000',
    width:220,
    marginRight:10,
    flex:1
  },
  propertyInner: {
    padding:10,
  },
  propertyTitle: {
    fontSize:16,
    backgroundColor:'#D9EEF4',
    padding:2,
    marginTop:10,
  },
  propertyInfo:{
    flexDirection: 'row',
    marginTop:5,
  },
  propertyPhoto: {
    width:80,
    height:60,
    marginRight:5,
  },
  suggestText: {
    fontSize: 15,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 2,
  },
  template: {
    backgroundColor: "#ffffff",
    width:'100%',
    padding:15,
  },
  templateText: {
    marginRight:35,
  },
  templateList: {
    marginTop:10,
    flex:1,
  },
  CollapseHeader: {
    fontSize:16,
    marginVertical:5,
  },
  CollapseBodyText: {
    fontSize:15,
    marginVertical:3
  },
  close: {
    position: 'absolute',
    top:10,
    right:15,
  },
  line: {
    backgroundColor: "#ffffff",
    width:'70%',
    height:150,
    padding:15,
  },
  menuBox: {
    width:80,
    height:80,
    backgroundColor:'#edf2ff',
    borderWidth:2,
    borderColor:'#1f2d53',
    borderRadius:20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:30,
    marginHorizontal:10,
  },
  iconText: {
    fontSize:12,
    fontWeight:'600',
    color:'#1f2d53',
    marginTop:5,
    textAlign:'center',
  },
  sydemenu: {
    position:'absolute',
    top:30,
    zIndex:1000,
    width:'100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menucircle: {
    width:65,
    height:65,
    backgroundColor:'#edf2ff',
    borderWidth:3,
    borderColor:'#1f2d53',
    borderRadius:100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal:10,
  },
  cus_label: {
    color: '#7d7d7d',
    fontSize:16,
  },
  cus_contents: {
    fontWeight:'500',
    marginVertical:5,
    marginHorizontal:10,
  },
  overlap_btnwrap: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 15
  },
  overlap3: {
    borderWidth:1,
    borderColor:'#1f2d53',
    borderRadius:10,
    marginVertical:5,
    padding:5,
  },
  follow_item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical:5
  },
  follow_item_btn: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    width:80,
    height:40,
    borderWidth:1,
    borderColor:'#1f2d53',
    marginHorizontal:10
  },
  editor: {
    borderColor: '#1f2d53',
    borderWidth: 1,
  },
})