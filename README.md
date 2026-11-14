# CryCare

CryCare is an experimental infant-monitoring prototype with a Flask web interface, audio-related model utilities, and an Arduino sketch. The repository includes pages for a dashboard, history, settings, and chat-style interaction.

## Project components

- `app.py`: Flask and Socket.IO web application
- `templates/` and `static/`: interface pages and browser assets
- `baby_status_fixed.py` and `list_models.py`: supporting Python scripts
- `hardware.ino`: Arduino sketch

This repository is a prototype, not a medical device. It cannot diagnose an infant or replace advice from a qualified clinician. Do not use its output to make care decisions.

Before running or deploying it, review credential handling and replace any exposed credentials. Do not put keys in README files, source control, or public examples.
