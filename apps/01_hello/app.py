from flask import Flask

# Flaskアプリケーションのインスタンスを作成
app = Flask(__name__)

# ルートパス（'/'）にアクセスした時の処理を定義
@app.route('/')
def hello_world():
    return 'Hello, AI Driven World!'

# アプリケーションを実行
if __name__ == '__main__':
    # host='0.0.0.0'で全てのIPアドレスからアクセス可能にする
    # debug=Trueで開発時のデバッグモードを有効にする
    app.run(host='0.0.0.0', port=5000, debug=True)