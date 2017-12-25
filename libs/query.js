let path = require('path');
let file = path.resolve("./database/mock-test.db");
let sqlite3 = require("sqlite3").verbose();

module.exports = function (mode, sql, array) {
    mode = mode == 'all' ? 'all' : mode == 'get' ? 'get' : 'run';
    return new Promise(function (resolve, reject) {
        let db = new sqlite3.Database(file);
        db[mode](sql, array, function (err, rows) {
            // console.log("===============>>>>.");
            // console.log(arguments);
            if (!err) {
                resolve(rows);
                db.close();
            } else {
                reject(err);
            }
        });
    });
};