const http = require("http");
// const fs = require("fs").promises;
const fs = require("fs/promises");

const server = http.createServer(async (req, res) => {
    // res.writeHead因為瀏覽器會根據這個回應格式，正確的將資料呈現在瀏覽器上
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf8",
    });
//try catch 除錯用
    try {
        //writeFile以同步方式將簡單的字串寫入檔案
        await fs.writeFile(
            __dirname + "/../data/header01.txt",
            JSON.stringify(req.headers)
        );
        res.end("完成寫檔3a");
    } catch (ex) {
        console.log(ex);
        res.end("發生錯誤3a");
    }
});

server.listen(3000);
