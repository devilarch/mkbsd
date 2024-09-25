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
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    filtered_wallpapers = {}

    for id, wallpaper in wallpaper_data['data'].items():
        if search_query in id.lower():
            filtered_wallpapers[id] = wallpaper

    # Calculate start and end indices for pagination
    start_index = (page - 1) * per_page
    end_index = start_index + per_page

    paginated_wallpapers = dict(list(filtered_wallpapers.items())[start_index:end_index])

    return jsonify({
        "data": paginated_wallpapers,
        "total": len(filtered_wallpapers),
        "page": page,
        "per_page": per_page
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
