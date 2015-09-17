"use strict";
const pocketHome = process.cwd();
const path = require('path');
const https = require('https');
const qs = require('querystring');

const fs = require('fs');
const readability = require('node-readability');
const exec = require('child_process').exec;

const $util = require('./lib/util');

const postData = require('./lib/accessInfo'); 
const compose = require('./lib/composite'); 


fs.readFile(path.join(pocketHome, 'since'), function (err, timeData) {
    let content;
    if (err) return console.log(err);
    content = qs.stringify(postData);
    let options = $util.getConfig(content);
    var req = https.request(options, function(res) {
        var dataList = '';
        res.on('data', function(chunk) {
            dataList += chunk;
        });
        res.on('end', function(e) {
            console.log('request end');
            compose(dataList);
            //fs.writeFile(pocketHome + 'json_tpl', dataList, function () {});
        })
    });
    req.on('error', function(e) {
        console.log('Error got: ' + e.message);
    });
    req.write(content);
    req.end();
});
