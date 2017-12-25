/*
 * 工具
 * Author：Rookie
 * creatTs：2017-12-03
 */
const PREFIX = require("./const").PREFIX;
const fs = require('fs');
const path = require('path');

var tool = {
    getFilePath: function (project, url, method) {
        var str = url.trim().replace(PREFIX, "");
        if (str.substr(str.length - 1, 1) == "/") {
            var formatUrl = str.substring(0, str.length - 1);
        } else {
            var formatUrl = str;
        }
        // path.resolve是以项目目录为起点
        let projectDir = path.resolve('./resource/', project);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir);
        }
        var filePath = "./resource/" + project + "/" + method.toLowerCase() + formatUrl.replace(/\//g, '.') + ".json";
        return filePath;
    },
    getFilePathNoProject: function (url, method) {
        var str = url.trim().replace(PREFIX, "");
        var fileArray = [];
        var notAddToArray = [".DS_Store", "jsonList.json"];
        if (str.substr(str.length - 1, 1) == "/") {
            var formatUrl = str.substring(0, str.length - 1);
        } else {
            var formatUrl = str;
        }
        var fileName = method.toLowerCase() + formatUrl.replace(/\//g, '.') + ".json";
        // path.resolve是以项目目录为起点
        let topDir = path.resolve('./resource/');
        readDirSync = function (findDir) {
            const pa = fs.readdirSync(findDir);
            pa.forEach((name) => {
                const cur_path = `${findDir}/${name}`;
                const info = fs.statSync(cur_path);
                if (info.isDirectory()) {
                    readDirSync(cur_path);
                } else {
                    if (notAddToArray.indexOf(name) < 0) {
                        fileArray.push(cur_path);
                    }
                }
            });
        }
        readDirSync(topDir);
        // console.log("请求路径====>" + fileName);
        let finalUrl;
        fileArray.forEach(function (url, index) {
            let testEqual = tool.testUrl(fileName, url);
            if (testEqual) {
                // console.log("url=====>>>>>" + url);
                finalUrl = url;
            }
        });
        // console.log("请求路径====>" + fileName);
        // console.log("finalUrl====>" + finalUrl);
        return finalUrl;
    },
    //递归取出所有文件夹下所有文件的路径
    readDirSync: function (path) {
        const pa = fs.readdirSync(path);
        pa.forEach((name) => {
            const cur_path = `${path}/${name}`;
            const info = fs.statSync(cur_path);
            if (name != "jsonList.json" && name != ".DS_Store") {
                fileArray.push(cur_path);
            }
        });
    },
    testUrl: function (reqUrl, filePath) {
        // var filePath = "/tongpeifu/fine/:s";
        // var reqPath = "/tongpeifu/fine/hi";
        let reqSp = reqUrl;
        let fileSp = filePath;
        let dReg = new RegExp(/^[1-9]\d*$/);

        let isThis = true;
        if (reqSp == fileSp) {
            isThis = true;
        } else {
            if (fileSp.indexOf("/:d") > 0 || fileSp.indexOf("/:s") > 0) {
                let fileSpArray = fileSp.split("/");
                let reqSpArray = reqSp.split("/");

                if (fileSpArray.length == reqSpArray.length) {
                    fileSpArray.forEach((item, index, arr) => {
                        if (item != reqSpArray[index]) {
                            if (item == ":d") {
                                if (!dReg.test(reqSpArray[index])) {
                                    isThis = false;
                                }
                            } else if (item != ":d" && item != ":s" && item != reqSpArray[index]) {
                                isThis = false;
                            }
                        }
                    });
                } else {
                    isThis = false;
                }
            } else {
                isThis = false;
            }
        }
        if (isThis) {
            return true;
        } else {
            return false;
        }
    },
    saveName: function (obj) {
        //存储文件名和url到ajaxapilist文件
        var jsonName = './resource/jsonList.json';
        var read = new Promise(function (resolve, reject) {
            resolve(fs.readFileSync(jsonName))
        });

        var _write = new Promise(function (resolve, reject) {
            read.then(function (response) {
                var list = JSON.parse(response).dataList;
                var newDetailList = obj.del ? [] : [{
                    "title": obj.title,
                    "project": obj.project,
                    "url": obj.url,
                    "method": obj.method.toUpperCase()
                }];
                //如果是删除则不需要这个新的数据
                //合并json
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        //比较path，path不能重复
                        if (!(obj.url == list[i].url && obj.method.toUpperCase() == list[i].method)) {
                            newDetailList.push(list[i]);
                            continue;
                        }
                    }
                }
                // var jsonString = JSON.stringify(newDetailList, null, 4);
                resolve(fs.writeFileSync(jsonName, JSON.stringify({
                    warn: "存放所有的关系表，建议不要手动修改",
                    dataList: newDetailList
                }, null, 4)))
            }).catch(function (response) {
                resolve(fs.writeFileSync(jsonName, JSON.stringify({
                    "warn": "存放所有的关系表，建议不要手动修改",
                    "dataList": [{
                        "title": obj.title,
                        "project": obj.project,
                        "url": obj.url,
                        "method": obj.method
                    }]
                })))
            })
        })
    },
    updateName: function (obj) {
        //存储文件名和url到ajaxapilist文件
        var jsonName = './resource/jsonList.json';
        var read = new Promise(function (resolve, reject) {
            resolve(fs.readFileSync(jsonName))
        });
        var _write = new Promise(function (resolve, reject) {
            read.then(function (response) {
                var list = JSON.parse(response).dataList;
                if (list.length) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i]["url"] == obj["orginalUrl"] && list[i]['method'] == obj["orginalMethod"]) {
                            list[i]["title"] = obj["title"];
                            list[i]["project"] = obj["project"];
                            list[i]["url"] = obj["url"];
                            list[i]["method"] = obj["method"];
                            continue;
                        }
                    }
                }
                resolve(fs.writeFileSync(jsonName, JSON.stringify({
                    warn: "存放所有的关系表，建议不要手动修改",
                    dataList: list
                }, null, 4)))
            }).catch(function (response) {
                resolve(fs.writeFileSync(jsonName, JSON.stringify({
                    "warn": "存放所有的关系表，建议不要手动修改",
                    "dataList": [{
                        "title": obj.title,
                        "project": obj.project,
                        "url": obj.url,
                        "method": obj.method
                    }]
                })))
            })
        })
    }
};
module.exports = tool;