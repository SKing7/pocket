var http = require('http');
var pocket = require('/Users/liuakira/pocket/start.js');
var post_data = {
	formCheck: 'bc13d669bee6f96e2effa334f3c5ce48',
    since: 1381470918,
	appsInfo: 'summary'
}; //这是需要提交的数据
var home = '/Users/liuakira/';
var fs = require('fs');
fs.readFile(home + 'config/pocket_since', function (err, data) { 
var time = parseInt(data + '');
console.log(time);
post_data.since = time;
var exec = require('child_process').exec;
var qs = require('querystring');
var content = qs.stringify(post_data);
var op = {
    host: 'getpocket.com',
    method: 'POST',
    path: '/a/x/get.php',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': content.length,
        'cookie': 'sess_user_id=9255001; sess_password=75ed394a296ff142fd6ef48b35cb7286;'
    }
};
var req = http.request(op, function(res) {
    var dataList = '';
    res.on('data', function(chunk) {
        dataList += chunk;
    });
    res.on('end', function(e) {
        var list = JSON.parse(dataList).list,
            hasUpdate = false;

        for (var i in list) {
            if (list.hasOwnProperty(i)) {
                hasUpdate = true;
                break;
            }
        }
        console.log(hasUpdate);
        if (hasUpdate) {
            exec('echo "has update since:' + time + '" >> ~/log/pocket/getpocket.log 2>&1 && date >> ~/log/pocket/getpocket.log 2>&1');
            pocket.start(function () {});
            fs.writeFile(home + 'config/pocket_since', parseInt(new Date().getTime() / 1000), function (e) {
                console.log(e);
            });
            setTimeout(function () {
                exec('~/pocket/pullpush.sh', function (e) {
                    if (e)
                        exec('date >> ~/log/pocket/pullpush.log 2>&1 && echo "' + e + '" >> ~/log/pocket/pullpush.log 2>&1', function (e) {});
                });
            }, 1000)
        }
    });
});
req.on('error', function(e) {
    console.log('Error got: ' + e.message);
});
req.write(content);
req.end();
});
