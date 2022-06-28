require("dotenv").config();
const express = require("express");

const multer = require("multer");
// const upload = multer({ dest:'tmp-uploads/' });
const upload = require(__dirname + "/modules/upload-images");
const session = require("express-session");
const moment = require('moment-timezone');

const db = require(__dirname + '/modules/mysql-connect');
//跟著前面session
const MysqlStore = require('express-mysql-session')(session);
//{}空物件 db為連線物件
const sessionStore = new MysqlStore({}, db);

const app = express();
//註冊樣版引擎
app.set("view engine", "ejs");
//區分網址大小寫
app.set("case sensitive routing", true);


app.use(
    session({
        // 新用戶沒有使用到 session 物件時不會建立 session 和發送 cookie
        saveUninitialized: false,
        resave: false, // 沒變更內容是否強制回存
        secret: "dsdasfdsgfsdg34324235gdfgfgsg",//加密用的字串
        //有store就會在資料庫裡創session
        store: sessionStore,
        cookie: {
            maxAge: 1200000, // 20分鐘，單位毫秒
        },
    })
);
// -----------------------Top-level middlewares-----------------------------//
//有這兩個就能處理全部進來的檔案
// middlewares處理進來的檔案
//express.urlencoded({ extended: false }) 
//use接收所有http的方法
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// -----------------------------------------------
app.use((req, res, next) => {
    res.locals.shinder = "哈囉";
    next();
});

//.get是接受的方法 後面"/"裡面是路徑
app.get("/try-qs", (req, res) => {
    res.json(req.query);
});

// middleware: 中介軟體 (function)多個的時候要用[]
// const bodyParser = express.urlencoded({extended: false});
app.post("/try-post", (req, res) => {
    res.json(req.body);
});

app.route("/try-post-form")
    .get((req, res) => {
        res.render("try-post-form");
    })
    .post((req, res) => {
        const { email, password } = req.body;
        res.render("try-post-form", { email, password });
    });
//上面是下面的縮寫
/*
    app.get('/try-post-form', (req, res)=>{
    });
    app.post('/try-post-form', (req, res)=>{
    });
    */

app.post("/try-upload", upload.single("avator"), (req, res) => {
    res.json(req.file);
});

//要傳全部資料用req.body
app.post("/try-uploads", upload.array("photos"), (req, res) => {
    res.json(req.files);
});

// ------------------------------------------------
//localhost:3600/try-params1/123/123出現第一行
//localhost:3600/try-params1/123出現第二行
//localhost:3600/try-params1出現第三行
//:action?/:id? 有問號的可有可無
app.get("/try-params1/:action/:id", (req, res) => {
    res.json({ code: 2, params: req.params });
});
app.get("/try-params1/:action", (req, res) => {
    res.json({ code: 3, params: req.params });
});
app.get("/try-params1/:action?/:id?", (req, res) => {
    res.json({ code: 1, params: req.params });
});

// --------------------------------------------------
// 有包含hi的網頁都能用hi要放在前面
app.get(/^\/hi\/?/i, (req, res) => {
    res.send({ url: req.url });
});
app.get(["/aaa", "/bbb"], (req, res) => {
    res.send({ url: req.url, code: "array" });
});

//自動把json檔轉陣列
app.get('/try-json', (req, res)=>{
    const data = require(__dirname + '/data/data01');
    console.log(data);
    //變數rows=(data)
    //locals前端
    res.locals.rows = data;
    //render樣板在views下
    //res渲染到views裡的try-json.ejs
    res.render('try-json');
});

app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    //moment()現在時間
    const m1 = moment();
    const m2 = moment('2022-02-28');

    res.json({
        m1: m1.format(fm),
        m1a: m1.tz('Europe/London').format(fm),
        m2: m2.format(fm),
        m2a: m2.tz('Europe/London').format(fm),
    })
});

const adminsRouter = require(__dirname + "/routes/admins");
// prefix 前綴路徑
app.use("/admins", adminsRouter);
app.use(adminsRouter);

app.get("/try-session", (req, res) => {
    req.session.my_var = req.session.my_var || 0; // 預設為 0
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session,
    });
});

//只接受用戶端用get來拜訪
app.get("/", (req, res) => {
    //render預設是丟出html
    res.render("main", { name: "Shinder" });
});

// ------- static folder -----------
//function是個特殊物件 可以加屬性在上面
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));

// ------- 404 -----------
//404要放在所有路由的後面
app.use((req, res) => {
    res.send(`<h2>找不到頁面 404</h2>
    <img src="/imgs/404-01-scaled.jpg" alt="" width="800px" />
    `);
});

app.listen(process.env.PORT, () => {
    console.log(`server started: ${process.env.PORT}`);
    console.log({ NODE_ENV: process.env.NODE_ENV });
});

//後端路由與前端路由比較 後端優先  除非有pushState會先跑前端

//0623 1436 0057
//  app.get() app.post() app.put() app.delete() app.METHDO()
//send一個物件會變成JSON send第一次已經把文件的body送出去 再送一次會從header送就會出錯
//status 數字
