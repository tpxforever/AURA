# AURA: Personalized Voice Assistant

## Project Overview
**Project Name**: AURA  
**Team Members**: 3 members  
**Technologies Used**:  
- **Google TTS (Text-to-Speech)** for text-to-speech conversion  
- **Google Gemini API** for the voice assistant capabilities

## Problem Statement
In the year 2080, artificial intelligence and chatbots are projected to be deeply integrated into our daily lives, assisting with a wide array of tasks. This includes everything from cooking and managing household chores to offering mental health support, providing motivation, and offering financial advice. However, as AI assistants grow in use, there is a major challenge: the lack of personalization in these interactions.

People need more than just functional assistance; they crave connections that match their preferences in tone, empathy, and communication style. A generic assistant may not fully understand the importance of offering comforting advice during tough times or be able to adjust its humor based on the user’s mood. To address this, our solution envisions a more nuanced AI assistant that recognizes individual preferences in the way it communicates, making interactions more relatable, engaging, and ultimately more useful.

## Our Solution
AURA is a software solution designed to cater to the personal preferences of each user. With AURA, users can customize their voice assistant’s characteristics, including humor, empathy, honesty, and sarcasm settings. This customization allows for a more personalized experience when interacting with the assistant, ensuring that responses are tailored to the user’s needs and emotional state. For example, if the user is looking for motivation, the assistant can respond with an encouraging tone and humorous quips, or if the user is seeking financial advice, the assistant may respond with a professional yet empathetic tone.

By providing this level of personalization, AURA aims to bridge the gap between functional assistance and emotional connection, making the interaction feel more human and engaging for the user. Whether it's offering a laugh during a tough moment or providing clear and honest advice, AURA is designed to respond in the most appropriate and customized manner based on the user's preferences.

## Summary of our Code
When you run the code, you are first taken to our Login page, where you would login ideally using your google account (OAuth). Once you login, you are sent to your home page where you have all the different assistants you have already created which is stored in a database using SQLite. You also have the option to create a new assistant which would then update the database. When you decide to create a new assistant, you first give it a name and then using scrollers can choose the level of empathy, humor, honesty and sarcasm you want your response to be. We were able to implement this using the Gemini API and also make it understand any language while responding in the same language along with its english language. Once we type what we want our assistant to do, We get an audio response using the Google TTS (Text To Speech) feature and pygame implementation. 
