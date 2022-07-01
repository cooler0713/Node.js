require("dotenv").config();
const express = require("express");

const multer = require("multer");
//{ dest:'tmp-uploads/' }上傳檔案放在裡面
// const upload = multer({ dest:'tmp-uploads/' });
const upload = require(__dirname + "/modules/upload-images");
const session = require("express-session");
const moment = require("moment-timezone");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const { toDateString, toDatetimeString } = require(__dirname +
    "/modules/date-tools");

const db = require(__dirname + "/modules/mysql-connect");
//跟著前面const session
const MysqlStore = require("express-mysql-session")(session);
//{}空物件 db為連線物件
const sessionStore = new MysqlStore({}, db);
const cors = require('cors')

const app = express();
//註冊樣版引擎
app.set("view engine", "ejs");
//區分網址大小寫
app.set("case sensitive routing", true);

// -----------------------Top-level middlewares-----------------------------//
const corsOptions = {
    credentials: true,
    origin: (origin, cb)=>{
        console.log({origin});
        cb(null, true);
    }
};

app.use(cors(corsOptions));
app.use(
    session({
        //saveUninitialized resave 會影響效能所以預設false
        // 新用戶沒有使用到 session 物件時不會建立 session 和發送 cookie
        saveUninitialized: false,
        resave: false, // 沒變更內容是否強制回存
        secret: "dsdasfdsgfsdg34324235gdfgfgsg", //加密用的字串
        //有store就會在資料庫裡創session
        store: sessionStore,
        cookie: {
            maxAge: 1200000, // 20分鐘，單位毫秒
        },
    })
);


//有這兩個就能處理全部進來的檔案
// middlewares處理進來的檔案
//express.urlencoded({ extended: false })
//use接收所有http的方法
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// -----------------------------------------------
app.use((req, res, next) => {
    // res.locals.shinder = '哈囉';

    // template helper functions
    res.locals.toDateString = toDateString;
    res.locals.toDatetimeString = toDatetimeString;
    res.locals.session = req.session;
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
//使用.route()是一種推薦的方法來避免重複路由命名和拼寫錯誤
app.route("/try-post-form")
    .get((req, res) => {
        //.render是 express 預設 template 就是會放在 views 資料夾裡面
        res.render("try-post-form");
    })
    .post((req, res) => {
        // 把emil password從.body拿出來
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
//單一個檔案放.file
//avator為上傳的欄位
app.post("/try-upload", upload.single("avatar"), (req, res) => {
    res.json(req.file);
});

//要傳全部資料用req.body
//多個檔案放.files
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
app.get("/try-json", (req, res) => {
    const data = require(__dirname + "/data/data01");
    console.log(data);
    //變數rows=(data)
    //locals前端
    res.locals.rows = data;
    //render樣板在views下
    //res渲染到views裡的try-json.ejs
    res.render("try-json");
});

app.get("/try-moment", (req, res) => {
    const fm = "YYYY-MM-DD HH:mm:ss";
    //moment()現在時間
    const m1 = moment();
    const m2 = moment("2022-02-28");

    res.json({
        m1: m1.format(fm),
        m1a: m1.tz("Europe/London").format(fm),
        m2: m2.format(fm),
        m2a: m2.tz("Europe/London").format(fm),
    });
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

app.use("/address-book", require(__dirname + "/routes/address-book"));
app.use('/carts', require(__dirname + '/routes/carts'));
//引用yahoo網站
app.get("/yahoo", async (req, res) => {
    axios.get("https://tw.yahoo.com/").then(function (response) {
        // handle success
        console.log(response);
        res.send(response.data);
    });
});
//登入表單
app.route("/login")
    .get(async (req, res) => {
        res.render("login");
    })
    .post(async (req, res) => {
        const output = {
            success: false,
            error: "",
            code: 0,
        };
        const sql = "SELECT * FROM admins WHERE account=?";
        const [r1] = await db.query(sql, [req.body.account]);
        //length 為Array物件的屬性
        if (!r1.length) {
            // 帳號錯誤
            output.code = 401;
            output.error = "帳密錯誤";
            return res.json(output);
        }
        //const row = r1[0];

        output.success = await bcrypt.compare(
            req.body.password,
            r1[0].pass_hash
        );
        // console.log(await bcrypt.compare(req.body.password, r1[0].pass_hash));
        if (!output.success) {
            // 密碼錯誤
            output.code = 402;
            output.error = "帳密錯誤";
        } else {
            req.session.admin = {
                sid: r1[0].sid,
                account: r1[0].account,
            };
        }

        res.json(output);
    });
//登出
app.get("/logout", (req, res) => {
    delete req.session.admin;
    //redirect (https://itbilu.com/nodejs/npm/EJD5cyg3l.html)
    res.redirect("/");
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
app.use("/joi", express.static("node_modules/joi/dist"));

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
