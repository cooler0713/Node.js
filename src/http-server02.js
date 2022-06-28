const http = require("http");
const fs = require("fs");


//因為要先寫入要再讀取檔案所以err放在寫入的func裡
const server = http.createServer((req, res) => {
    //writeFile以同步方式將簡單的字串寫入檔案
    fs.writeFile(
        __dirname + "/../data/header01.txt",
        //JSON.stringify轉乘JSON檔
        // headers用戶端傳送過來的檔頭變成object  
        JSON.stringify(req.headers),
        (err) => {
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf8",
            });
            if (err) {
                console.log(err);

                res.end("發生錯誤");
            } else {
                res.end("完成寫檔");
            }
        }
    );
});

server.listen(3000);
