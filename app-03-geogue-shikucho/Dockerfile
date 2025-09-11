# 公式のNginxイメージをベースにする
FROM nginx:stable-alpine

# このフォルダにあるゲームのファイル全てを、
# Nginxが公開するフォルダ(/usr/share/nginx/html)にコピーする
COPY . /usr/share/nginx/html