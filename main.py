from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load the wallpaper data from the provided JSON
with open('wallpaper_data.json', 'r') as f:
    wallpaper_data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/wallpapers')
def get_wallpapers():
    return jsonify(wallpaper_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
