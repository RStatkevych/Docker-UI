#!/bin/bash
sudo docker rm -f /my-nginx
sudo docker run --name my-nginx -p 80:80 -e 5000 -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf -d nginx nginx-debug -g 'daemon off;'

