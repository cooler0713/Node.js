//dotenv 是將 .env 文件中的環境參數加載到 process.env。這個檔要建立在最外層資料夾，在其他文件中先引入 require('dotenv').config() 後只要再呼叫 PROCESS.ENV.[變數名稱] 就能將此環境參數撈出來了

require("dotenv").config();

const { DB_USER, DB_PASS } = process.env;

console.log({ DB_USER, DB_PASS });
