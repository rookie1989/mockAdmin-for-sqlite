let router = require('koa-router')();
let path = require('path');
let exec = require('child_process').exec;
var thisJs = path.resolve('./bin/rebuildList.js');
let cmdStr = 'node ' + thisJs + '';
// not work
router.get('/rebuild', function (ctx, next) {
    exec(cmdStr, function (err, stdout, stderr) {
    });
    ctx.response.body = {
        success: true,
        message: "重构成功"
    };
});
module.exports = router