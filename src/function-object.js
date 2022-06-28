function genObject(){
    return {
        name: 'peter',
        age:26,
    };
};

//在func裡加屬性 可能與原來屬性衝突
genObject.method01 = ()=>{
    console.log('method01');
};

const obj = genObject();
console.log(obj);
genObject.method01();

//（建構子）是個隨著 class 一同建立並初始化物件的特殊方法。
console.log(genObject.constructor.name);

