const db = require(__dirname + "/../modules/mysql-connect.js");

const bcrypt = require("bcryptjs");

const sql =
    "INSERT INTO `admins`(`account`, `pass_hash`, `created_at`) VALUES ('ming', ?, NOW())";

(async () => {
    var hash = await bcrypt.hash("123456", 10);

    console.log({ hash });

    const r = await db.query(sql, [hash]);
    console.log(r);
    process.exit();
})();
