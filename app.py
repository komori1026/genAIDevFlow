from flask import Flask
from datetime import datetime, timezone, timedelta

# Flaskアプリケーションのインスタンスを作成
app = Flask(__name__)

# 日本時間のタイムゾーンを定義
JST = timezone(timedelta(hours=9))

def get_greeting_by_time(hour):
    """時間帯に応じた挨拶を返す関数"""
    if 5 <= hour < 10:
        return "おはよう"
    elif 10 <= hour < 18:
        return "こんにちは"
    elif 18 <= hour < 23:
        return "こんばんは"
    else:
        return "おやすみなさい"

# ルートパス（'/'）にアクセスした時の処理を定義
@app.route('/')
def get_current_time_with_greeting():
    # 現在の日本時間を取得
    jst_now = datetime.now(JST)
    
    # 時間帯に応じた挨拶を取得
    greeting = get_greeting_by_time(jst_now.hour)
    
    # 現在時刻を文字列形式でフォーマット
    current_time_str = jst_now.strftime("%Y年%m月%d日 %H時%M分%S秒")
    
    # 挨拶と現在時刻を返す
    return f"{greeting}！<br>現在の日本時間: {current_time_str}"

# アプリケーションを実行
if __name__ == '__main__':
    # host='0.0.0.0'で全てのIPアドレスからアクセス可能にする
    # debug=Trueで開発時のデバッグモードを有効にする
    app.run(host='0.0.0.0', port=5000, debug=True)