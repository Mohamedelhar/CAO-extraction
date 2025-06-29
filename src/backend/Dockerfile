# Stap 1: Gebruik een officiële Python-runtime als basisimage
FROM python:3.11-slim

# Stap 2: Installeer systeembibliotheken die nodig zijn voor de app
# - poppler-utils: voor het omzetten van PDF naar afbeeldingen (vereist door pdf2image)
# - tesseract-ocr: de OCR-engine
# - tesseract-ocr-nld: het Nederlandse taalpakkeT voor Tesseract
# - git: soms nodig voor het installeren van dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-nld \
    git \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Stap 3: Stel de werkmap in de container in
WORKDIR /app

# Stap 4: Kopieer de requirements en installeer de Python-packages
# Dit wordt apart gedaan zodat Docker deze laag kan cachen,
# wat builds versnelt als alleen de code verandert, niet de dependencies.
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Stap 5: Kopieer de rest van de backend-applicatiecode naar de werkmap
COPY . .

# Stap 6: Vertel Docker dat de container op poort 10000 luistert
# Render.com zal deze poort automatisch detecteren en gebruiken.
EXPOSE 10000

# Stap 7: Definieer de commando om de app te draaien met Gunicorn
# Gunicorn is een productie-waardige WSGI-server voor Python.
# We binden aan 0.0.0.0 zodat de server bereikbaar is van buiten de container.
# Render stelt de $PORT variabele in, waar Gunicorn naar zal luisteren.
# server:app verwijst naar het 'app' object in het 'server.py' bestand.
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT}", "server:app"] 