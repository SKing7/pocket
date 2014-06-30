#!/bin/sh 
cd /Library/WebServer/Documents/sking7.github.com
git add .
git pull
git commit -a -m 'add article'
git push 
