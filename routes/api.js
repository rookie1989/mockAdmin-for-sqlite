const PREFIX = require("../libs/const").PREFIX;
const router = require('koa-router')();
const path = require('path');
let tool = require("../libs/tool");
router.prefix(PREFIX);

var query = require("../libs/query");

router.get('/', function (ctx, next) {
    ctx.response.type = 'json';
    ctx.response.body = {data: 'Hello World'};
})
// *匹配以api为首的接口
router.all('/*', async (ctx, next) => {
    ctx.response.type = 'json';
    var req = ctx.request;
    let method = req.method.toUpperCase() || "GET";
    let path = req.path.replace(PREFIX, "");
    let sqlAll = 'select id,url,method from mock where method=?';
    let getAllData = await query("all", sqlAll, [method]);

    // console.log(getAllData);
    let rightId;
    getAllData.map((item, index) => {
        if (item.method.toUpperCase() == method) {
            if (tool.testUrl(path, item.url)) {
                rightId = item.id;
            }
        }
    });
    let sql = 'select code from mock where id=?';
    if (rightId) {
        let getData = await query("get", sql, [rightId]);
        if (getData) {
            response = JSON.parse(getData['code']);
            ctx.response.body = response || {};
        } else {
            ctx.response.body = {
                results: "Path does not exist /(ㄒoㄒ)/~~"
            };
        }
    } else {
        ctx.response.body = {
            results: "Path does not exist /(ㄒoㄒ)/~~"
        };
    }
})
module.exports = router
