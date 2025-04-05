import google.generativeai as genai
import json
import os
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return render_template("home.html")


# Set this to your actual Gemini API key (store in env var ideally)
GEMINI_API_KEY = "AIzaSyClR-zfEQ9m8DkhemP2elrUgJOckSXYX8U"
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-pro")

@app.route("/api/dialogue", methods=["POST"])
def generate_dialogue():
    config = request.get_json()
    tone = config.get("tone", "friendly")
    formality = config.get("formality", "casual")
    proactivity = config.get("proactivity", 5)

    prompt = f"""
    Act as a home assistant robot with this personality:
    - Tone: {tone}
    - Formality: {formality}
    - Proactivity level: {proactivity}/10

    Say a default greeting to the user.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as e:
        text = f"[Gemini Error] {str(e)}"

    return jsonify({"response": text})

SETTINGS_FILE = "user_settings.json"

@app.route("/api/settings", methods=["POST"])
def save_settings():
    config = request.get_json()
    with open(SETTINGS_FILE, "w") as f:
        json.dump(config, f)
    return jsonify({"status": "saved", "config": config})

@app.route("/api/settings", methods=["GET"])
def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        return jsonify({"error": "No settings found"}), 404
    with open(SETTINGS_FILE, "r") as f:
        config = json.load(f)
    return jsonify(config)

@app.route("/main")
def main_page():
    return render_template("main.html")

if __name__ == '__main__':
    app.run(debug=True)