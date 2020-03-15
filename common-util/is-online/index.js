// 检查是否有网
const isOnline = require('is-online');
 
(async () => {
    console.log(await isOnline());
    //=> true
})();
