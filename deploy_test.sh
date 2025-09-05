#!/bin/bash

# --- テスト環境デプロイスクリプト ---
# 目的：GitHubの最新コードを取得し、テスト環境(5001番ポート)を更新する。

echo ">>> 1. GitHubから最新のソースコードを取得します..."
git pull

echo ">>> 2. 古いテスト用コンテナを停止・削除します..."
# 5001番ポートで動いているコンテナのIDを取得
CONTAINER_ID=$(docker ps -q --filter "publish=5001")

# コンテナIDが見つかった場合のみ、停止・削除を実行
if [ -n "$CONTAINER_ID" ]; then
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    echo "古いテスト用コンテナを削除しました。"
else
    echo "稼働中のテスト用コンテナはありません。"
fi

echo ">>> 3. 新しいテスト用イメージをビルドします..."
docker build -t my-flask-app:testing .

echo ">>> 4. 新しいテスト用コンテナを5001番ポートで起動します..."
docker run -d -p 5001:5000 my-flask-app:testing

echo "---"
echo "✅ テスト環境のデプロイが完了しました！"
echo "以下のURLにアクセスして確認してください。"
echo "http://116.80.76.58:5001"
