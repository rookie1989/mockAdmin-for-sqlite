const router = require('koa-router')();
const path = require('path');
const tool = require('../libs/tool');
const filter = require('../libs/filter');

const query = require("../libs/query");
const moment = require('moment');

router.get('/', async (ctx, next) => {
    if (!filter.checkLogin(ctx)) {
        await ctx.redirect('/login');
        return;
    }
    var mockList = []
    let sql = 'select m.id,m.title,m.url,m.method,m.created_ts,m.updated_ts,p.name as project,p.code as project_code from mock m left join project p on m.project_id=p.id';
    mockList = await query("all", sql);

    var module = [];
    var projectList = [];
    var pmObj = new Object();

    mockList.sort(function (a, b) {
        var aUrlSortVal = a.url.split("/")[1];
        var bUrlSortVal = b.url.split("/")[1];
        return aUrlSortVal[0] > bUrlSortVal[0];
    });
    mockList.map((item, index) => {
        let urlStr = item.url.substr(1);
        let urlStr2 = urlStr.split("/")[0];
        let projectStr = item.project;


        if (!pmObj[projectStr]) {
            pmObj[projectStr] = new Array();
        }
        if (pmObj[projectStr].indexOf(urlStr2) < 0) {
            pmObj[projectStr].push(urlStr2);
        }

        if (module.indexOf(urlStr2) < 0) {
            module.push(urlStr2);
        }
        if (projectList.indexOf(projectStr) < 0) {
            projectList.push(projectStr);
        }
        item["module"] = urlStr2;
    });

    await ctx.render('index', {
        title: "API Admin",
        list: mockList,
        module: module,
        projectList: projectList,
        pmObj: pmObj
    })
});

router.get('/login', async (ctx, next) => {
    if (filter.checkLogin(ctx)) {
        await ctx.redirect('/');
    } else {
        await ctx.render('login')
    }
});
router.post('/user/login', async (ctx, next) => {
    let body = ctx.request.body;
    let userName = body.userName;
    let password = body.password;
    if (filter.login(userName, password)) {
        // 成功登录
        ctx.cookies.set('__mock_admin_filter_character', userName + "_" + password);
        // ctx.cookies.set("Max-Age=120000")
        ctx.response.body = {
            success: true,
            message: "登录成功"
        };
    } else {
        ctx.response.body = {
            success: false,
            message: "登录失败"
        };
    }
});
router.post('/editApi', async (ctx, next) => {
    let body = ctx.request.body;
    let id = body.id;
    let title = body.title;
    let project_id = body.project.toLowerCase() == "buy" ? 2 : 1;
    let url = body.url;
    let method = body.method.toUpperCase();
    let code = body.code;
    let updated_ts = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    ctx.response.type = 'json';
    let sqlUpdate = 'update mock set title=?,project_id=?,url=?,method=?,code=?,updated_ts=? where id=?';
    let sqlById = 'select * from mock where id=?';
    let sqlInsertLog = 'INSERT INTO logs (uid, type,mock_id,created_ts) VALUES (?,?,?,?)';
    let updateResult = await query("run", sqlUpdate, [title, project_id, url, method, code, updated_ts, id]);
    let getResultById = await query("get", sqlById, [id]);
    let addLog = await query("run", sqlInsertLog, [1, 2, id, updated_ts]);
    // console.log(getResultById);
    if (getResultById['updated_ts'] == updated_ts && getResultById['title'] == title && getResultById['project_id'] == project_id && getResultById['url'] == url && getResultById['method'] == method) {
        ctx.response.body = {
            success: true,
            message: "保存成功"
        };
    } else {
        ctx.response.body = {
            success: false,
            message: "保存失败"
        };
    }
});

router.post('/addApi', async (ctx, next) => {
    let body = ctx.request.body;
    let title = body.title;
    let project_id = body.project.toLowerCase() == "buy" ? 2 : 1;
    let url = body.url;
    let method = body.method.toUpperCase();
    let code = body.code;
    let created_ts = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    let sqlInsert = 'INSERT INTO mock (title, project_id,url,method,code,created_ts,updated_ts) VALUES (?,?,?,?,?,?,?)';
    let getResult = await query("run", sqlInsert, [title, project_id, url, method, code, created_ts, created_ts]);
    let sqlByUrlMethod = 'select id from mock where url=? and method = ?';
    let getInserId = await query("get", sqlByUrlMethod, [url, method]);
    console.log(getInserId.id);

    let sqlInsertLog = 'INSERT INTO logs (uid, type,mock_id,created_ts) VALUES (?,?,?,?)';
    let addLog = await query("run", sqlInsertLog, [1, 1, getInserId.id, created_ts]);

    if (getInserId.id && getInserId.id > 0) {
        ctx.response.body = {
            success: true,
            message: "新增接口成功"
        };
    } else {
        ctx.response.body = {
            success: false,
            message: "新增接口失败"
        };
    }
});

router.post('/deleteApi', async (ctx, next) => {
    let body = ctx.request.body;
    let id = body.id;
    let created_ts = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    let sqlDelete = 'delete from mock where id=?';
    let sqlQId = 'select * from mock where id=?';
    let getResult = await query("run", sqlDelete, [id]);
    let getIDRow = await query("get", sqlQId, [id]);
    // console.log("getIDRow================>" + getIDRow);
    // console.log(getIDRow);
    let sqlInsertLog = 'INSERT INTO logs (uid, type,mock_id,created_ts) VALUES (?,?,?,?)';
    let addLog = await query("run", sqlInsertLog, [1, 0, id, created_ts]);
    if (getIDRow == undefined) {
        ctx.response.body = {
            success: true,
            message: "删除成功"
        };
    } else {
        ctx.response.body = {
            success: false,
            message: "删除失败"
        };
    }
})

module.exports = router
