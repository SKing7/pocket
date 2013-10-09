var dom = require("jsdom");
dom.env(
    '<p><a class="the-link" href="https://github.com/tmpvar/jsdom">jsdom\'s Homepage</a></p>',
    ["http://code.jquery.com/jquery.js"],
    function (errors, window) {
        console.log("contents of a.the-link:", window.$("a.the-link").text());
    }
);
