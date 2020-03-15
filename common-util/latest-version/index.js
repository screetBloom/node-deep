const latestVersion = require('latest-version');
 
(async () => {
    console.log(await latestVersion('@rome/cli'));
})();