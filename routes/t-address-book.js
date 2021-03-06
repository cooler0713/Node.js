const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');
const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/../modules/date-tools');

const router = express.Router(); // 建立 router 物件

const getListHandler = async (req, res)=>{
    let output = {
        perPage: 10,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        code: 0,  // 辨識狀態
        error: '',
        rows: []
    };
    let page = +req.query.page || 1;
    if(page<1) {
        output.code = 410;
        output.error = '頁碼太小';
        return output;
    }

    const sql01 = "SELECT COUNT(1) totalRows FROM address_book";
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            output.totalPages = totalPages;
            output.code = 420;
            output.error = '頁碼太大';
            return output;
        }

        const sql02 = `SELECT * FROM address_book LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach(el=> el.birthday = toDateString(el.birthday) );
        output.rows = r2;
    }
    output.code = 200;
    output = {...output, page, totalRows, totalPages};

    return output;
};

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