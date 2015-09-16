"use strict";
module.exports = {
    formatDate(d) {
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
    },
    getConfig(content) {
        var op = {
            host: 'getpocket.com',
            method: 'POST',
            path: '/v3/get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': content.length
            }
        };
        return op;
    },
}
