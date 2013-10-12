//exports.start =  function (callBack) {
var http = require('http');
var qs = require('querystring');
var post_data = {
	consumer_key: '18912-37d0890e4e3864e0b5a0164b',
    sort:'oldest',
	access_token: 'fb51f73a-64f4-78a5-f157-c052ef'
}; //这是需要提交的数据
var fs = require('fs');
var clear = require('./node-readability/lib/readability.js');
var dom = require("jsdom");
var exec = require('child_process').exec;
var githubHome = '/Library/WebServer/Documents/sking7.github.com/';
var pocketHome = '/Users/liuakira/pocket/'
var content;
//var listTpl = '<div data-id="{id}" class="woo"><div class="j"><div class="mbpho" style="height:266px;"><a target="_blank" class="a" href="{url}"><img data-rootid="{id}" data-iid="{id}" src="http://cdn.duitang.com/uploads/item/201303/22/20130322143937_mdf5i.thumb.200_0.jpeg" height="266"/></a></div><div class="g">{des}</div><div class="g">{timeAdd}</div></div></div>';
var listTpl = '<h3>\
        <a target="article" href="articles/{id}.html">{title}</a>\
        <a class="real-link" href="{url}" target="_blank">Go</a>\
        <span class="time-label">[{timeAdd}]</span>\
    </h3>\r\n';
var resTpl = '<link rel="stylesheet" href="../css/article.css" />\n';

function sub(tpl, config) {
    for (var i in config) {
        if (config.hasOwnProperty(i)) {
            tpl = tpl.replace('{' + i + '}', config[i]);
        }
    }
    return tpl; 
}
function specialChar(str) {
    return str.replace(/\>/g, '&gt;').replace(/\>/g, '&lt;');
}

function getMyDate(d) {
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
};
fs.readFile(pocketHome + 'since', function (err, timeData) {
    if (err) return console.log(err);
    //post_data.since = parseInt(timeData);
    content = qs.stringify(post_data);
    var op = {
        host: 'getpocket.com',
        method: 'POST',
        path: '/v3/get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };
    var req = http.request(op, function(res) {
        var dataList = '';
        res.on('data', function(chunk) {
            dataList += chunk;
        });
        res.on('end', function(e) {
            //callBack();
            fs.writeFile(pocketHome + 'json_tpl', dataList, function () {});
            var articleList = fs.readdirSync(githubHome + 'articles/');
            //read head
            fs.readFile(githubHome + 'index_tmp.html', function (err, dataIndex) {
                if (err) return console.log(err);
                console.log('read tmp done');
                var arrData = [];
                var objData = JSON.parse(dataList).list;
                if (objData.length <= 0) return console.log('no update; done');
                for(var i in objData) {
                    objData[i].id = i;
                    arrData.push(objData[i]);
                }
                var since = JSON.parse(dataList).since;
                fs.writeFile(pocketHome + 'since', since, function (err) {
                    if (err) return console.log(err);
                    console.log('time update done');
                });
                //删除已经在pocket删除的文章
                var deleteShell = 'cd ' + githubHome + 'articles && rm ';
                articleList.forEach(function (a) {
                   var tmp = a.replace('.html', '');
                   if (!objData[tmp]) {
                        deleteShell += ' ' + a;
                   } 
                });
                arrData.sort(function (a, b) {
                    return b.time_added - a.time_added;
                });
                for (var i in arrData) {
                    var htmlArticle = ''; 
                    var objTmp = arrData[i];
                    dataIndex += sub(listTpl, {
                        id:  objTmp['id'],
                        title : objTmp['given_title'],
                        timeAdd : getMyDate(new Date(objTmp['time_added'] * 1000)),
                        url : objTmp['given_url'],
                        des: objTmp['excerpt']
                        
                    });
                    (function (i, objTmp, htmlArticle) {
                    //已经在目录存在的文章不再重复下载
                       if (articleList.indexOf(i + '.html') < 0) {
                           //fs.readFile(githubHome + 'artical_footer.html', function (err, dataJs) {
                               //htmlArticle += data;
                               exec('curl ' + objTmp['given_url'], function (err, data) {
                                    console.log('curl url done');
                                    clear.parse(data, objTmp['given_url'], function (data) {
                                        var result;
                                        result = '<!doctype html>\n';
                                        result += '<html>\n';
                                        result += '<head>\n';
                                        result += '\<meta\ charset="utf-8"/\>\n';
                                        result += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n';
                                        result += sub('<title>{title}</title>\n', {
                                            title : data.title
                                        });

                                        result  += resTpl;
                                        result += '</head>\n';
                                        result += '<body>\n';
                                        result += '<div class="m-content">\n';
                                        result += sub('<h1>{title}</h1>\n', {
                                            title : data.title
                                        });
                                        result += data.content;
                                        result += '</div>\n';
                                        result += '</body>\n';
                                        result += '</html>';
                                        fs.writeFile(githubHome + 'articles/' + i + '.html', result, 'utf8', function (err, data) { 
                                            console.log('write ready ');
                                        }); 
                                    });
                               });
                           //});
                       } 
                   })(objTmp.id, objTmp, htmlArticle);
                }
                dataIndex += '\r\n';
                //read footer
                fs.readFile(githubHome + 'index_tmp_footer.html', function(err, data) {
                    if (err) return console.log(err);
                    console.log('read tmp footer done');
                    dataIndex += data;
                    //create index
                    fs.writeFile(githubHome + 'index.html', dataIndex, function (err) {
                        if (err) return console.log(err);
                        console.log(deleteShell);
                        exec(deleteShell, function (err, data) {
                            if (err) return console.log(err);
                            console.log('rm done');
                        });
                    })
                });
            }); 
        })
    });
    req.on('error', function(e) {
        console.log('Error got: ' + e.message);
    });
    req.write(content);
    req.end();
});
//}
