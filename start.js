var http = require('http');
var qs = require('querystring');
var post_data = {
	consumer_key: '18912-37d0890e4e3864e0b5a0164b',
	access_token: 'fb51f73a-64f4-78a5-f157-c052ef'
}; //这是需要提交的数据
var content = qs.stringify(post_data);
var fs = require('fs');
var exec = require('child_process').exec;
var githubHome = '/Library/WebServer/Documents/sking7.github.com/';
//var content=qs.stringify(post_data);
var op = {
	host: 'getpocket.com',
	method: 'POST',
	path: '/v3/get',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': content.length
	}
};
fs.readFile('./since', function (err, timeData) {
    if (err) return console.log(err);
    console.log('time read done');
    op.since = parseInt(timeData);
    console.log(op);
    var req = http.request(op, function(res) {
        var dataList = '';
        res.on('data', function(chunk) {
            dataList += chunk;
        });
        res.on('end', function(e) {
            fs.readFile(githubHome + 'index_tmp.html', function (err, dataIndex) {
                if (err) return console.log(err);
                console.log('read tmp done');
                var objData = JSON.parse(dataList).list;
                //var since = JSON.parse(dataList).since;
                fs.writeFile('./since', new Date().getTime(), function (err) {
                    if (err) return console.log(err);
                    console.log('time update done');
                });
                for (var i in objData) {
                    dataIndex += '<h3><a href="articals/'+ i + '.html">' + objData[i]['given_title'] + '</a></h3>\r\n';
                    exec('curl ' + objData[i]['given_url'] + ' > ' + githubHome + 'articles/' + i + '.html')
                }
                dataIndex += '\r\n';
                fs.readFile(githubHome + 'index_tmp_footer.html', function(err, data) {
                    if (err) return console.log(err);
                    console.log('read tmp footer done');
                    dataIndex += data;
                    fs.writeFile(githubHome + 'index.html', dataIndex, function (err) {
                        if (err) return console.log(err);
                        })
                    });
                }); 
            })
        });
    });
    req.on('error', function(e) {
        console.log('Error got: ' + e.message);
    });
    req.write(content);
    req.end();
});

