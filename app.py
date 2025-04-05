import google.generativeai as genai
import json
import os
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

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
    empathy = db.Column(db.Integer, default=50)
    humor = db.Column(db.Integer, default=50)
    honesty = db.Column(db.Integer, default=50)
    sarcasm = db.Column(db.Integer, default=50)

    def to_dict(self):
        return {
            "id": self.id,
            "empathy": self.empathy,
            "humor": self.humor,
            "honesty": self.honesty,
            "sarcasm": self.sarcasm
        }

# ------------------------------
# Gemini API Setup
# ------------------------------
GEMINI_API_KEY = "AIzaSyClR-zfEQ9m8DkhemP2elrUgJOckSXYX8U"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

# ------------------------------
# Routes
# ------------------------------
@app.route("/")
def home():
    return render_template("home.html")  # or whatever your landing page is called

@app.route("/main")
def main():
    return render_template("main.html")  # main app UI

@app.route("/api/dialogue", methods=["POST"])
def generate_dialogue():
    config = request.get_json()
    empathy = config.get("empathy", 50)
    humor = config.get("humor", 50)
    honesty = config.get("honesty", 50)
    sarcasm = config.get("sarcasm", 50)

    prompt = f"""
    Act as a home assistant robot with this personality configuration:
    - Empathy: {empathy}%
    - Humor: {humor}%
    - Honesty: {honesty}%
    - Sarcasm: {sarcasm}%

    Greet the user according to these personality traits.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as e:
        text = f"[Gemini Error] {str(e)}"

    return jsonify({"response": text})


@app.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.get_json()

    settings = UserSettings(
        empathy=data.get("empathy", 50),
        humor=data.get("humor", 50),
        honesty=data.get("honesty", 50),
        sarcasm=data.get("sarcasm", 50),
    )
    db.session.add(settings)
    db.session.commit()

    return jsonify({"status": "saved", "config": settings.to_dict()})


@app.route("/api/settings", methods=["GET"])
def load_settings():
    settings = UserSettings.query.order_by(UserSettings.id.desc()).first()
    if settings:
        return jsonify(settings.to_dict())
    else:
        return jsonify({"error": "No settings found"}), 404


# ------------------------------
# App Entry Point
# ------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
