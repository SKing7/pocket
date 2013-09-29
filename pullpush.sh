#!/bin/sh 
cd /Library/WebServer/Documents/sking7.github.com
git add .
git pull
git ci -a -m 'aaa'
git push 
