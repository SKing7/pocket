"use strict";
const $util = require('./util');
const fs = require('fs');
const path = require('path');
const pathSet = require('./path');
const githubHome = pathSet.githubHome;
const pocketHome = process.cwd();
const $template = require('./template');

const listItemGenerator = $template.listItem; 
const detailPageGenerator = $template.detailPage;

module.exports = function (dataList) {

    var articleListOld = fs.readdirSync(path.join(githubHome, 'articles'));
    var objData = JSON.parse(dataList).list;
    if (objData.length <= 0) {
        log('no update; done');
        return;
    }
    writeSinceTime(JSON.parse(dataList).since);

    //删除已经在pocket删除的文章

    headerPart().then(function (dataHeader) {
        var arrData = processData(objData);
        var dataBody = bodyPart(arrData);
        log(dataBody);
        footerPart(dataHeader + dataBody).then(function () {
            var toDel = [];
            articleListOld.forEach(function (item) {
               if (!ifExist(tmp)) {
                    toDel.push(a);
               } 
            });
            log(toDel);
            deleteFiles(toDel);

            function delelteFiles(files) {
                if (!files.length) return;
                var deleteShell = 'cd ' + githubHome + '/articles && rm ';
                exec(deleteShell + files.join(' '), function (err, data) {
                    if (err) return log(err);
                    log('rm done');
                });
            }
        });
    })
    function headerPart() {
        var p = new Promise(function (resolve, reject) {
            fs.readFile(path.join(githubHome , 'index_tmp.html'), function (err, dataHeader) {
                dataHeader = dataHeader.toString('utf8');
                if (err) { 
                    reject(err);
                } else {
                    resolve(dataHeader);
                }
            });
        });
        return p;
    }
    function bodyPart(data) {
        var itemData = '';
        data.every(objTmp => {
            itemData += listItemGenerator(objTmp['id'],
                objTmp['resolved_title'],
                objTmp['given_url'],
                $util.formatDate(new Date(objTmp['time_added'] * 1000)));
                //objTmp['excerpt']

            //已经在目录存在的文章不再重复下载
             if (articleListOld.indexOf(objTmp.id + '.html') < 0) {
                 detailPagePart(objTmp['given_url']);
             } 
        });
        return itemData;
    }
    function detailPagePart(url) {
       readability(url, function (err, data) {
            if (err || !data) {
                log(err || 'readability return data is null');
                return;
            }
            var result = detailPageGenerator(data.title, data.content); 
            log('request done:', objTmp['given_url']);
            fs.writeFile(path.join(githubHome,  'articles/' + i + '.html'), result, 'utf8', function (err, data) { 
                log('write ready ');
            }); 
        });
    }
    function ifExist(item) {
        item = item.replace(/\.html$/, '');
        return objData[item]
    }
    function footerPart(dataTop) {
        var p = new Promise(function (resolve, reject) {
            fs.readFile(path.join(githubHome, 'index_tmp_footer.html'), function(err, dataFooter) {
                var resultData = dataTop + dataFooter;
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
                log(resultData);
                fs.writeFile(path.join(githubHome, 'index.html'), resultData, function (err) {
                    log('write done');
                })
            });
        });
        return p;
    }
    function log(msg) {
        console.log.apply(console, arguments);
    }
    function processData(obj) {
        var tmpArr = [];
        var keys = Object.keys(obj)
        keys.forEach(function (v) {
            tmpArr.push(obj[v]);
        });
        return tmpArr;
    };
    function writeSinceTime (since) {
        fs.writeFile(path.join(pocketHome, 'since'), since, function (err) {
            if (err) return log(err);
            log('time update done');
        });
    };
}
