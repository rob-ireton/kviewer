# Building

``docker build . -t robertireton/kviewer-gateway:latest``

``docker push robertireton/kviewer-gateway``


# Running

# As daemon on host
``sudo apt install nginx``

``sudo vim /etc/nginx/sites-available/default``

copy the default config file into this

``sudo nginx -t``

``systemctl restart nginx``

## In docker

Note:
This is currently tbc as the port is not needed. I may need to jump straight to k8s and port forward nginx. I will need to modify the rules in the nginx config though to the k8s dns service names.

``docker run --net=host -d --name kviewer-gateway -p 8888:8888 robertireton/kviewer-gateway``

# Urls

The Nginx is configured as reverse proxy and will serve as follows:

localhost:8888/

to UI

localhost:8888/api/pods
localhost:8888/api/events
localhost:8888/api/deployments

to kvewer server