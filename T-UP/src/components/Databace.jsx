import * as SQLite from "expo-sqlite";

// DB接続
const db = SQLite.openDatabase("db");

export default function CreateDB(props){
  
  return new Promise((resolve, reject)=>{
  db.transaction((tx) => {
    
    
    // お客様一覧のスタッフ選択固定のためのDBカラム追加
    tx.executeSql(
      `select * from staff_list where (account = 'all');`,
      [],
      (_, { rows }) => {
        if (rows._array.length == 0) {
          tx.executeSql(
            `insert into staff_list values ('all','','','');`,
            [],
            () => {
              console.log("all OK");
            },
            () => {console.log("all 失敗");}
          );
        }
      },
      () => {
        console.log("失敗");
      }
    );
      
    tx.executeSql(
      `PRAGMA table_info('staff_list');`,
      [],
      (_, { rows }) => {
        
        
        if(rows._array.length == 3) {
          tx.executeSql(
            `alter table "staff_list" add column "check" text;`,
            [],
            () => {console.log("カラム追加");},
            (e) => {console.log("カラム失敗");}
          );
        }
      },
      () => {
        console.log("失敗");
        
      }
    );
    
    // お客様一覧「ステータス」追加
    tx.executeSql(
      `PRAGMA table_info('customer_mst');`,
      [],
      (_, { rows }) => {
        
        
        if(rows._array.length == 16) {
          tx.executeSql(
            `alter table "customer_mst" add column "status" text;`,
            [],
            () => {console.log("カラム追加");},
            (e) => {console.log("カラム失敗");}
          );
        }
      },
      () => {
        console.log("失敗");
        
      }
    );
    
    // スタッフテーブル　カラム追加
    // メール表示名、個人メールアドレス1～3、設定2-4(top_staff_list)、設定2-7(setting_list7_mail)
    tx.executeSql(
      `PRAGMA table_info('staff_mst');`,
      [],
      (_, { rows }) => {
        
        
        if(rows._array.length == 17) {
          
          tx.executeSql(
            `alter table "staff_mst" add column "line_id" text;`,
            [],
            () => {console.log("LINEid追加");},
            (e) => {console.log("LINEid失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "mail_name" text;`,
            [],
            () => {console.log("メール表示名追加");},
            (e) => {console.log("メール表示名失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "mail1" text;`,
            [],
            () => {console.log("個人メールアドレス1追加");},
            (e) => {console.log("個人メールアドレス1失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "mail2" text;`,
            [],
            () => {console.log("個人メールアドレス2追加");},
            (e) => {console.log("個人メールアドレス2失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "mail3" text;`,
            [],
            () => {console.log("個人メールアドレス3追加");},
            (e) => {console.log("個人メールアドレス3失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "top_staff_list" text;`,
            [],
            () => {console.log("設定2-4追加");},
            (e) => {console.log("設定2-4失敗");}
          );
          
          tx.executeSql(
            `alter table "staff_mst" add column "setting_list7_mail" text;`,
            [],
            () => {console.log("設定2-7追加");},
            (e) => {console.log("設定2-7失敗");}
          );
          
        }
      },
      () => {
        console.log("スタッフテーブル　カラム追加失敗");
        
      }
    );
    
    tx.executeSql(
      `select * from staff_mst;`,  
      [],
      () => {console.log("ローカルDBはすでに作成されています");},
      () => {
  
              // スタッフテーブル追加
              tx.executeSql(
                `CREATE TABLE "staff_mst" (
                	"account"	TEXT UNIQUE,
                	"password"	TEXT,
                	"shop_id"	TEXT,
                	"name_1"	TEXT,
                	"name_2"	TEXT,
                	"name"	TEXT,
                	"corporations_name"	TEXT,
                	"setting_list"	TEXT,
                	"app_token"	TEXT,
                	"system_mail"	TEXT,
                	"yahoomail"	TEXT,
                	"gmail"	TEXT,
                	"hotmail"	TEXT,
                	"outlook"	TEXT,
                	"softbank"	TEXT,
                	"icloud"	TEXT,
                	"original_mail"	TEXT,
                	"line_id"	TEXT,
                	"mail_name"	TEXT,
                	"mail1"	TEXT,
                	"mail2"	TEXT,
                	"mail3"	TEXT,
                	"top_staff_list"	TEXT,
                	"setting_list7_mail"	TEXT,
                	PRIMARY KEY("account")
                );`,
                [],
                () => {console.log("スタッフテーブル追加");},
                () => {console.log("スタッフテーブル追加失敗");}
              );
              
              // スタッフインデックス作成
              tx.executeSql(
                `CREATE INDEX "index_staff_mst" ON "staff_mst" (
                	"account",
                	"shop_id"
                );`,
                [],
                () => {console.log("スタッフインデックス作成");},
                () => {console.log("スタッフインデックス作成失敗");}
              );
              
              // スタッフ一覧テーブル追加
              tx.executeSql(
                `CREATE TABLE "staff_list" (
                	"account"	TEXT UNIQUE,
                	"name_1"	TEXT,
                	"name_2"	TEXT,
                	"check"	TEXT,
                	PRIMARY KEY("account")
                );`,
                [],
                () => {console.log("スタッフ一覧テーブル追加");},
                () => {console.log("スタッフ一覧テーブル追加失敗");}
              );
              
              // スタッフ一覧インデックス作成
              tx.executeSql(
                `CREATE INDEX "index_staff_list" ON "staff_list" (
                	"account"
                );`,
                [],
                () => {console.log("スタッフ一覧インデックス作成");},
                () => {console.log("スタッフ一覧インデックス作成失敗");}
              );
              
              // お客様テーブル追加
              tx.executeSql(
                `CREATE TABLE "customer_mst" (
                	"customer_id" TEXT UNIQUE,
                	"name" TEXT,
                	"kana" TEXT,
                	"time"	TEXT,
                	"title"	TEXT,
                	"note"	TEXT,
                	"mail1"	TEXT,
                	"mail2"	TEXT,
                	"mail3"	TEXT,
                	"line"	TEXT,
                	"staff_name"	TEXT,
                	"media"	TEXT,
                	"article_url"	TEXT,
                	"reverberation_user_id"	TEXT,
                	"coming_user_id"	TEXT,
                	"coming_day1"	TEXT,
                	"status"	TEXT,
                	PRIMARY KEY("customer_id")
                );`,
                [],
                () => {console.log("お客様テーブル追加");},
                () => {console.log("お客様テーブル追加失敗");}
              );
              
              // お客様インデックス作成
              tx.executeSql(
                `CREATE INDEX "index_customer_mst" ON "customer_mst" (
                	"customer_id"
                );`,
                [],
                () => {console.log("お客様インデックス作成");},
                () => {console.log("お客様インデックス作成失敗");}
              );
              
              // コミュニケーション履歴テーブル追加
              tx.executeSql(
                `CREATE TABLE "communication_mst" (
                	"communication_id" TEXT UNIQUE,
                	"customer_id" TEXT,
                	"speaker" TEXT,
                	"time" TEXT,
                	"title" TEXT,
                	"note" TEXT,
                	"line_note" TEXT,
                	"file_path" TEXT,
                	"status" TEXT,
                	"html_flg" TEXT,
                	PRIMARY KEY("communication_id")
                );`,
                [],
                () => {console.log("コミュニケーション履歴テーブル追加");},
                () => {console.log("コミュニケーション履歴テーブル追加失敗");}
              );
              
              // コミュニケーション履歴インデックス作成
              tx.executeSql(
                `CREATE INDEX "index_communication_mst" ON "communication_mst" (
                	"customer_id",
                	"time",
                	"status"
                );`,
                [],
                () => {console.log("コミュニケーション履歴インデックス作成");},
                () => {console.log("コミュニケーション履歴インデックス作成失敗");}
              );
              
              // 定型文テーブル追加
              tx.executeSql(
                `CREATE TABLE "fixed_mst" (
                	"fixed_id"	TEXT,
                	"category"	TEXT,
                	"title"	TEXT,
                	"mail_title"	TEXT,
                	"note"	TEXT
                );`,
                [],
                () => {console.log("定型文テーブル追加");},
                () => {console.log("定型文テーブル追加失敗");}
              );
              // 定型文インデックス作成
              tx.executeSql(
                `CREATE INDEX "index_fixed_mst" ON "fixed_mst" (
                	"category"
                );`,
                [],
                () => {console.log("定型文インデックス作成");},
                () => {console.log("定型文インデックス作成失敗");}
              );
              
              // 駅・エリアテーブル追加
              tx.executeSql(
                `CREATE TABLE "station_mst" (
                	"id"	TEXT,
                	"name"	TEXT
                );`,
                [],
                () => {console.log("駅・エリアテーブル追加");},
                () => {console.log("駅・エリアテーブル追加失敗");}
              );
              
              // 住所テーブル追加
              tx.executeSql(
                `CREATE TABLE "address_mst" (
                	"id"	TEXT,
                	"name"	TEXT
                );`,
                [],
                () => {console.log("住所テーブル追加");},
                () => {console.log("住所テーブル追加失敗");}
              );
              
              resolve();
            }
    );
    // tx.executeSql(
    //   `drop table staff_mst;`,
    //   [],
    //   () => {console.log("staff_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table staff_list;`,
    //   [],
    //   () => {console.log("staff_list 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table customer_mst;`,
    //   [],
    //   () => {console.log("customer_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table communication_mst;`,
    //   [],
    //   () => {console.log("communication_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table fixed_mst;`,
    //   [],
    //   () => {console.log("fixed_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table station_mst;`,
    //   [],
    //   () => {console.log("station_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    // tx.executeSql(
    //   `drop table address_mst;`,
    //   [],
    //   () => {console.log("address_mst 削除");},
    //   () => {console.log("失敗");}
    // );
    
    // カラム名確認
    // tx.executeSql(
    //   `PRAGMA table_info('customer_mst');`,
    //   [],
    //   (_, { rows }) => {
    //     // console.log(rows._array);
    //     rows._array.map((n) =>{
    //       console.log(n.name)
    //     })
    //   },
    //   () => {
    //     console.log("失敗");
        
    //   }
    // );
    
  });
  
  resolve();
  // db.transaction((tx) => {
  //   tx.executeSql(
  //     // 実行したいSQL文
  //     // `select * from sample_table;`,
  //     `select * from staff_mst;`,
  //     // SQL文の引数
  //     [],
  //     // 成功時のコールバック関数
  //     (_, { rows }) => {
  //       if (rows._array) {
  //         console.log(rows._array);
  //       }
  //     },
  //     () => {
  //       // 失敗時のコールバック関数
  //       console.log("select faile");
  //     }
  //   )
  // })
  });
  
}
/**
* データを取得する
*/
function select() {
  db.transaction((tx) => {
    tx.executeSql(
      // 実行したいSQL文
      // `select * from sample_table;`,
      `select * from staff_mst;`,
      // SQL文の引数
      [],
      // 成功時のコールバック関数
      (_, { rows }) => {
        if (rows._array) {
          r = 1;
        }
      },
      () => {
        // 失敗時のコールバック関数
        console.log("select faile");
      }
    )
  })
}