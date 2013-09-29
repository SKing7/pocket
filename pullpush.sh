#!/bin/sh 
cd /Library/WebServer/Documents/sking7.github.com
git add .
git pull
git ci -a -m ''
git push 
