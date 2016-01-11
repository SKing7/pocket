#!/bin/sh 
cd ~/dev/
gulp sw
cd sking7.github.com
git add .
git pull
git commit -a -m 'update config and update articles'
git push 
