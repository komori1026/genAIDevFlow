#!/bin/bash

# --- 本番環境デプロイスクリプト ---
# 目的：テスト済みのイメージを使って、本番環境(5000番ポート)を更新する。

echo ">>> 1. 古い本番用コンテナを停止・削除します..."
# 5000番ポートで動いているコンテナのIDを取得
CONTAINER_ID=$(docker ps -q --filter "publish=5000")

# コンテナIDが見つかった場合のみ、停止・削除を実行
if [ -n "$CONTAINER_ID" ]; then
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    echo "古い本番用コンテナを削除しました。"
else
    echo "稼働中の本番用コンテナはありません。"
fi

echo ">>> 2. テスト済みのイメージ(my-flask-app:testing)を本番用コンテナとして起動します..."
docker run -d -p 5000:5000 my-flask-app:testing

echo "---"
echo "✅ 本番環境のデプロイが完了しました！"
echo "以下のURLにアクセスして確認してください。"
echo "http://116.80.76.58:5000"
```

---
### **【重要】スクリプトに実行権限を与える**

ファイルを作成しただけでは、まだ実行できません。
サーバーのターミナルで、以下の2つのコマンドを実行して、スクリプトに**「実行して良いですよ」という許可（権限）**を与えてください。

```bash
chmod +x deploy_test.sh
chmod +x deploy_prod.sh
