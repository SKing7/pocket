var http = require('http');
var qs = require('querystring');
var post_data = {
	consumer_key: '18912-37d0890e4e3864e0b5a0164b',
    sort:'oldest',
	access_token: 'fb51f73a-64f4-78a5-f157-c052ef'
}; //这是需要提交的数据
var fs = require('fs');
var dom = require("jsdom");
var exec = require('child_process').exec;
var githubHome = '/Library/WebServer/Documents/sking7.github.com/';
var pocketHome = '/Users/liuakira/pocket/'
var content;
var listTpl = '<h3>\
        <a target="article" href="articles/{index}.html">{title}</a>\
        <a class="real-link" href="{url}" target="_blank">Go</a>\
        <span class="time-label">[{timeAdd}]</span>\
    </h3>\r\n';
var jsTpl = '\n<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>\n'+
    '<script src="../js/clearly.js"></script>\n'+
    '<script>\n'+
        'var html = window.__getMyClearlyResults().html;\n'+
        '$("html").html(html);\n'+
        '$("body").append(\'<link type="text/css" href="../css/article.css">\')</script>\n';

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
                var deleteShell = 'rm';
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
                        index:  objTmp['id'],
                        title : objTmp['given_title'],
                        timeAdd : getMyDate(new Date(objTmp['time_added'] * 1000)),
                        url : objTmp['given_url']
                        
                    });
                    (function (i, objTmp, htmlArticle) {
                    //已经在目录存在的文章不再重复下载
                       if (articleList.indexOf(i + '.html') < 0) {
                           //fs.readFile(githubHome + 'artical_footer.html', function (err, dataJs) {
                               //htmlArticle += data;
                               console.log(objTmp);
                               exec('curl ' + objTmp['given_url'], function (err, data) {
                                    console.log('curl url done');
                                    dom.env(
                                        data,
                                        [],
                                        function (errors, window) {
                                            var div = window.document.createElement('div');
                                            div.innerHTML = jsTpl;
                                            window.document.body.appendChild(div)
                                            htmlArticle += '<html>';
                                            htmlArticle += window.document.documentElement.innerHTML;
                                            htmlArticle += '</html>';
                                            //fs.readFile(githubHome + 'artical_footer.html', function (err, data) {
                                                //console.log('read foot done' + i);
                                                //htmlArticle += data;
                                                fs.writeFile(githubHome + 'articles/' + i + '.html', htmlArticle, function (err, data) { 
                                                    console.log('write ready ');
                                                }); 
                                            //});
                                        }
                                    );
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
                            //if (err) return console.log(err);
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
