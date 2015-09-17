(function () {
    "use strict";
    var path = require('path');
    module.exports = {
        githubHome: path.join(process.cwd(), '../sking7.github.com'),
        template: {
            root: 'template', 
            paths: {
                header: 'index_header.html',
                footer: 'index_footer.html',
            }
        },
    };
}())
