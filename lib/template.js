module.exports = {
    detailRedirectPage(url) {
        return `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>重定向页面</title>
        </head>
        <body>
        <script type="text/javascript">   
            window.location.href='${url}';  
        </script> 
        <script>var _gaq = _gaq || []; _gaq.push(['_setAccount', 'UA-34802167-1']); _gaq.push(['_setDomainName', 'liuzhe.co']); _gaq.push(['_trackPageview']); (function() { var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s); })();</script>
        </body>
        </html>`;
    },
    detailPage(title, content) {
        var resTpl = '<link rel="stylesheet" href="../css/article.css" />';

        return `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>${title}</title>
            ${resTpl};
        </head>
        <body>
            <div class="m-content">
                <h1>${title}</h1>
                ${content}
            </div>
            <script>var _gaq = _gaq || []; _gaq.push(['_setAccount', 'UA-34802167-1']); _gaq.push(['_setDomainName', 'liuzhe.co']); _gaq.push(['_trackPageview']); (function() { var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s); })();</script>
        </body>
        </html>`;
    },
    listItem(id, title, url, timeAdd) {
        return `
            <li>
                <a target="article" href="articles/${id}.html">${title}</a>
                <a class="real-link" href="${url}" target="_blank">Origin</a>
                <span class="time-label">[${timeAdd}]</span>
            </li>`;
    },
}
