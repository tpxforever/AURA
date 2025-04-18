import google.generativeai as genai
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
from gtts import gTTS
import os
import tempfile
import sqlite3
import pygame

app = Flask(__name__)
CORS(app)

# ------------------------------
# Database Configuration
# ------------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user_settings.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------------------
# Model Definition
# ------------------------------
class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Assistant name
    empathy = db.Column(db.Integer, default=50)
    humor = db.Column(db.Integer, default=50)
    honesty = db.Column(db.Integer, default=50)
    sarcasm = db.Column(db.Integer, default=50)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "empathy": self.empathy,
            "humor": self.humor,
            "honesty": self.honesty,
            "sarcasm": self.sarcasm
        }

# ------------------------------
# Gemini API Setup
# ------------------------------
GEMINI_API_KEY = "AIzaSyClR-zfEQ9m8DkhemP2elrUgJOckSXYX8U"  # Replace with your API key
genai.configure(api_key=GEMINI_API_KEY)

# Try gemini-1.5-flash, or another valid model.
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error initializing gemini-1.5-flash: {e}")
    print("Trying to find alternative models...")
    available_models = [
        model for model in genai.list_models()
        if 'generateContent' in model.supported_generation_methods
    ]
    model = None
    if available_models:
        model = genai.GenerativeModel(available_models[0].name)
        print(f"Using alternative model: {available_models[0].name}")
    else:
        print("No suitable generative model found.")

# ------------------------------
# Routes
# ------------------------------
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/assistant")
def assistant():
    return render_template("assistant.html")

@app.route("/main")
def main():
    return render_template("main.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

@app.route("/api/dialogue", methods=["POST"])
def generate_dialogue():
    config = request.get_json()
    name = config.get("name", "Assistant")
    empathy = config.get("empathy", 50)
    humor = config.get("humor", 50)
    honesty = config.get("honesty", 50)
    sarcasm = config.get("sarcasm", 50)
    user_message = config.get("message", "")

    prompt = f"""
    Act as an assistant named {name} with the following personality configuration:
    - Empathy: {empathy}%
    - Humor: {humor}%
    - Honesty: {honesty}%
    - Sarcasm: {sarcasm}%

    Respond to the user message: "{user_message}"
    """

    if model:
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Text to speech using gTTS and pygame
            tts = gTTS(text)
            temp_file = tempfile.mktemp(".mp3")
            tts.save(temp_file)

            pygame.mixer.init()
            pygame.mixer.music.load(temp_file)
            pygame.mixer.music.play()

            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)

            pygame.mixer.quit()
            os.remove(temp_file)

        except Exception as e:
            text = f"[Gemini Error] {str(e)}"
    else:
        text = "Model not available"

    return jsonify({"response": text})

@app.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.get_json()

    settings = UserSettings(
        name=data.get("name", "Assistant"),
        empathy=data.get("empathy", 50),
        humor=data.get("humor", 50),
        honesty=data.get("honesty", 50),
        sarcasm=data.get("sarcasm", 50),
    )
    db.session.add(settings)
    db.session.commit()

    return jsonify({"status": "saved", "config": settings.to_dict()})

@app.route("/api/settings/<int:id>", methods=["PUT"])
def update_setting(id):
    data = request.get_json()
    setting = UserSettings.query.get_or_404(id)

    setting.name = data.get("name", setting.name)
    setting.empathy = data.get("empathy", setting.empathy)
    setting.humor = data.get("humor", setting.humor)
    setting.honesty = data.get("honesty", setting.honesty)
    setting.sarcasm = data.get("sarcasm", setting.sarcasm)

    db.session.commit()
    return jsonify(setting.to_dict())

@app.route("/api/settings", methods=["GET"])
def load_settings():
    settings = UserSettings.query.order_by(UserSettings.id.desc()).first()
    if settings:
        return jsonify(settings.to_dict())
    else:
        return jsonify({"error": "No settings found"}), 404

@app.route("/api/preset_chats", methods=["GET"])
def get_preset_chats():
    presets= UserSettings.query.all()
    preset_list = [preset.to_dict() for preset in presets]
    return jsonify(preset_list)

@app.route("/api/settings/<int:id>", methods=["GET"])
def get_settings_by_id(id):
    setting = UserSettings.query.get_or_404(id)
    return jsonify(setting.to_dict())

# ------------------------------
# App Entry Point
# ------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)