const db = require(__dirname + '/../modules/mysql-connect');

(async()=>{

    //results結果 fields一堆東西不重要
    const [results, fields] = await db.query("SELECT * FROM lesson LIMIT 5");

    console.log(results);
    // console.log(fields);
    process.exit();  // 結束行程
})();

