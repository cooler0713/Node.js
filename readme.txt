

req.query

req.body

req.params

req.file
req.files

req.session
------------------------------------
#只能用一種
res.end()

res.send()

res.json()

res.render()
------------------------------------
# RESTful API

# CRUD


# 列表 (GET)
/products
/products?page=2
/products?page=2&search=找東西

# 單一商品 (GET)
/products/:id

# 新增商品 (POST)
/products

# 修改商品 (PUT)
/products/:id

# 刪除商品 (DELETE)
/products/:id


#以下為不好範例
/products/:category_id/:product_id

------------------------------------
cart table 購物車的資料表參考
----------------
PK

item_type: product, event, ticket

user_id

item_id :12

quantity

created_at
------------------------------------


var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
# 給"B4c0/\/"密碼加密
# hash會變成一串加密後的字串
var hash = bcrypt.hashSync("B4c0/\/", salt);
# 驗證密碼是否正確
bcrypt.compareSync("B4c0/\/", hash); // true
bcrypt.compareSync("not_bacon", hash); // false

------------------------------------------------------------
同源政策 (Same-origin policy)
 protocol, domain, port