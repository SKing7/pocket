module.exports = function (dataList) {
    "use strict";

    const $util = require('./util');
    const fs = require('fs');
    const path = require('path');
    const exec =  require('child_process').exec;
    const readability = require('node-readability');
    const pathSet = require('./path');
    const pathTemplate = pathSet.template;
    const githubHome = pathSet.githubHome;
    const pocketHome = process.cwd();
    const $template = require('./template');

    const listItemGenerator = $template.listItem; 
    const detailPageGenerator = $template.detailPage;
    const detailRedirectPage = $template.detailRedirectPage;

    var articleListOld = fs.readdirSync(path.join(githubHome, 'articles'));
    var objData = JSON.parse(dataList).list;
    if (objData.length <= 0) {
        log('no update; done');
        return;
    }

    headerPart().then(function (headerData) {
        var arrData = processData(objData);
        var bodyData = bodyPart(arrData);
        return headerData + bodyData;
    }).then(function (contentData) {
        footerPart().then(function (footerData) {
            var resultData = contentData + footerData;
            fs.writeFile(path.join(githubHome, 'index.html'), resultData, function (err) {
                log('write done');
            });
        });
    //删除已经在pocket删除的文章
    }).then(function () {
        log('checking del...');
        var toDel = [];
        articleListOld.forEach(function (item) {
            if (!ifExist(item)) {
                toDel.push(item);
            } 
        });
        deleteFiles(toDel);

        function deleteFiles(files) {
            if (!files.length) return;
            var deleteShell = 'cd ' + githubHome + '/articles && rm ' + files.join(' ');
            log('delete operation: ', deleteShell);
            exec(deleteShell, function (err, data) {
                if (err) return log(err);
                log('rm done');
            });
        }
    });
    function headerPart() {
        var p = new Promise(function (resolve, reject) {
            fs.readFile(path.join(githubHome, pathTemplate.root, pathTemplate.paths.header), function (err, dataHeader) {
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
        for(let i = 0; i < data.length; i++) {
            let objTmp = data[i];
            itemData += getItemHtml(objTmp);
            //已经在目录存在的文章不再重复下载
            if (articleListOld.indexOf(objTmp.id + '.html') < 0) {
                detailPagePart(objTmp.given_url, objTmp.id);
            } 
        }
        return itemData;
        function getItemHtml(objTmp) {
            var dateFormat = $util.formatDate(new Date(objTmp.time_added * 1000));
            return listItemGenerator(objTmp.id, objTmp.resolved_title, objTmp.given_url, dateFormat);
            //objTmp['excerpt']
        }
    }
    function detailPagePart(url, id) {
        log('readability url: ', url);
        readability(url, function (err, data) {
            var result;
            if (err || !data) {
                //TODO #去掉重定向逻辑 && 监测响应错误类型
                log('request redirect done:', url);
                result = detailRedirectPage(url); 
            } else {
                result = detailPageGenerator(data.title, data.content); 
                log('request done:', url);
            }
            fs.writeFile(path.join(githubHome,  'articles/' + id + '.html'), result, 'utf8', function (err, data) { 
                log('write ready ');
            }); 
        });
    }
    function ifExist(item) {
        item = item.replace(/\.html$/, '');
        return objData[item];
    }
    function footerPart(dataTop) {
        var p = new Promise(function (resolve, reject) {
            fs.readFile(path.join(githubHome, pathTemplate.root, pathTemplate.paths.footer), function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return p;
    }
    function log(msg) {
        console.log.apply(console, arguments);
    }
    function processData(obj) {
        var tmpArr = [];
        var keys = Object.keys(obj);
        keys.forEach(function (v) {
            obj[v].id = v;
            tmpArr.push(obj[v]);
        });
        return tmpArr.reverse();
    }
    function writeSinceTime (since) {
        fs.writeFile(path.join(pocketHome, 'since'), since, function (err) {
            if (err) return log(err);
            log('time update done');
        });
    }
};
