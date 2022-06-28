const http = require("http");

//用戶來拜訪時丟出來的資料 
// res回應用戶端資料
const server = http.createServer((req, res) => {
    // res.writeHead因為瀏覽器會根據這個回應格式，正確的將資料呈現在瀏覽器上
    res.writeHead(200, {
        "Content-Type": "text/html",
    });
    //res.end把內容傳給用戶端(結束)
    res.end(`<h2>Hello</h2>
    <p>${req.url}</p>`);
});
//偵聽3000port
server.listen(3000);
