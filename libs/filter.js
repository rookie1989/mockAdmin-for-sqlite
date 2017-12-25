const md5 = require('md5');
const userInfo = require("./user");
/*
 * 路由拦截入口
 * Author：Rookie
 * creatTs：2016-08-07
 */
module.exports = {
    checkLogin: function (ctx, next) {
        if (!ctx.cookies.get("__mock_admin_filter_character")) {
            console.log("ee======>");
            return false;
        } else {
            return true;
        }
    },
    login: function (userName, password) {
        let isLogin = false;
        userInfo.loginUser.map((item, index) => {
            if (item.userName == userName && md5(item.password) == password) {
                isLogin = true;
            }
        });
        if (isLogin) {
            return true;
        } else {
            return false;
        }
    }
};