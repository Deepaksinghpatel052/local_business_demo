# Serves every folder in demos/ (and the showcase/ page at /) with Nginx. See docker/nginx.conf for the URLs.
FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/demos.conf
COPY demos/ /usr/share/nginx/demos/
COPY showcase/ /usr/share/nginx/showcase/
EXPOSE 80
