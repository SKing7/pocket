var http = require('http');
var qs=require('querystring');
var post_data={consumer_key:'18912-37d0890e4e3864e0b5a0164b', code:'a0181d0c-a2c8-7741-4383-3d37ff'};//这是需要提交的数据
var content=qs.stringify(post_data);
var op = {
    host: 'getpocket.com',
    method: 'post',
    path: '/v3/oauth/authorize',
    headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF8',
        'Content-Length':content.length
    }
};
var req = http.request(op, function (res) {
    res.on('data', function (chunk) {
        console.log('BODY:' + chunk);
    });
});
req.on('error', function (e) {
    console.log('Error got: ' + e.message);
});
req.write(content);
req.end();
