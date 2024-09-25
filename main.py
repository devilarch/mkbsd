from flask import Flask, render_template, jsonify, request
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
    search_query = request.args.get('search', '').lower()

    filtered_wallpapers = {}

    for id, wallpaper in wallpaper_data['data'].items():
        if search_query in id.lower():
            filtered_wallpapers[id] = wallpaper

    return jsonify({
        "data": filtered_wallpapers,
        "total": len(filtered_wallpapers)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
