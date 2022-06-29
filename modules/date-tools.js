const moment = require('moment-timezone');

const dateFormat = 'YYYY-MM-DD';
const datetimeFormat = 'YYYY-MM-DD HH:mm:ss';
//format 格式
const toDateString = (t)=> moment(t).format(dateFormat);
const toDatetimeString = (t)=> moment(t).format(datetimeFormat);

module.exports = {
    toDateString,
    toDatetimeString,
};