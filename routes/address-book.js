const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');

const {
        toDateString,
        toDatetimeString,
    } = require(__dirname + '/../modules/date-tools');
    const moment = require('moment-timezone');
    const upload = require(__dirname + '/../modules/upload-images')


const router = express.Router(); // 建立 router 物件

// router.getListH('/', async (req, res)=>{
const getListHandler = async (req, res)=>{
    let output = {
        perPage: 10, //每頁幾筆  
        page: 1,
        totalRows: 0, //totalRows總筆數
        totalPages: 0,
        code:0, //辨識狀態
        error:'',
        query: {},
        rows: []
    };
    
    let page = +req.query.page || 1;

    let search = req.query.search || '';
    let beginDate = req.query.beginDate || '';
    let endDate = req.query.endDate || '';
    let where = ' WHERE 1 ';
    if(search){
        // where += ` AND name LIKE '%${search}%' `; // bug
        where += ` AND name LIKE ${ db.escape('%'+search+'%') } `;
        output.query.search = search;
        output.showTest = db.escape('%'+search+'%'); // 測試, 查看
    }

    if(beginDate){
        const mo = moment(beginDate);
        if(mo.isValid()){
            where += ` AND birthday >= '${mo.format('YYYY-MM-DD')}' `;
            output.query.beginDate = mo.format('YYYY-MM-DD');
        }
    }
    if(endDate){
        const mo = moment(endDate);
        if(mo.isValid()){
            where += ` AND birthday <= '${mo.format('YYYY-MM-DD')}' `;
            output.query.endDate = mo.format('YYYY-MM-DD');
        }
    }

    //頁碼小於1就轉向1並結束
    if(page<1) {
        output.code = 410;
        output.error = '頁碼太小';
        return output;
    }

    //算總比數
    const sql01 = `SELECT COUNT(1) totalRows FROM address_book ${where}`;
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        //頁碼大於總頁碼轉向最大頁
        // if(page>totalPages){
        //     // res.redirect轉向
        //     return res.redirect(`?page=${totalPages}`);
        // }
        if(page>totalPages){
            output.totalPages = totalPages;
            output.code = 420;
            output.error = '頁碼太大';
            return output;
        }
        //取得每筆資料
        const sql02 = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        //新的el.birthday覆蓋掉原本的值
        // r2.forEach(el=> el.birthday = toDateString(el.birthday) );
        output.rows = r2;
    }
    output.code = 200;
    //展開設定每次都複製新資料進去output
    output = {...output, page, totalRows, totalPages};

    // res.render('address-book/main', output);
    return output;
};

router.get('/add', async (req, res)=>{
    res.render('address-book/add');
});

router.post('/add', upload.none(), async (req, res)=>{
    res.json(req.body);
});

router.get('/', async (req, res)=>{
    const output = await getListHandler(req, res);
    switch(output.code){
        case 410:
            return res.redirect(`?page=1`);
            break;
        case 420:
            return res.redirect(`?page=${output.totalPages}`);
            break;
    }
    res.render('address-book/main', output);
});
router.get('/api', async (req, res)=>{
    const output = await getListHandler(req, res);
    res.json(output);
});

module.exports = router;