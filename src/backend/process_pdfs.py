import os
import re
import json
import time
from datetime import datetime
import pandas as pd
import pdfplumber
import pytesseract
import requests
from pdf2image import convert_from_path

# --- Configuratie ---
# TODO: Gebruik environment variabelen voor de API key in een productie-omgeving.
OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "deepseek/deepseek-r1:free"

# --- Stap 1: Functies uit zebi.ipynb (PDF Analyse) ---

def extract_text_from_pdf_with_ocr(pdf_path, min_text_length=100):
    """
    Probeert eerst tekst digitaal te extraheren. Als dat te weinig tekst oplevert,
    schakelt het automatisch over naar OCR met Tesseract.
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\\n"
        print("Methode: Digitale extractie (pdfplumber) geslaagd.")
    except Exception as e:
        print(f"Fout tijdens digitale extractie: {e}. Probeert nu OCR.")
        text = ""

    if len(text.strip()) >= min_text_length:
        return text

    print(f"Digitale extractie leverde < {min_text_length} tekens op. Overschakelen naar OCR...")
    try:
        images = convert_from_path(pdf_path)
        ocr_text = ""
        for i, image in enumerate(images):
            print(f"  Verwerken van pagina {i+1} met OCR...")
            ocr_text += pytesseract.image_to_string(image, lang='nld') + "\\n"
        print("Methode: OCR-extractie (Tesseract) geslaagd.")
        return ocr_text
    except Exception as e:
        print(f"Fout tijdens OCR-extractie: {e}")
        return None

def extract_percentage_sentences(text):
    """
    Zoekt naar zinnen in de tekst die percentages bevatten,
    met een focus op contexten die gerelateerd kunnen zijn aan loonstijgingen.
    """
    if not text:
        return []

    # De door de gebruiker gecorrigeerde en werkende regex.
    # De sleutel is '\d' in plaats van '\\d'.
    percentage_pattern = re.compile(
        r'([^.?!]*?(?:loon|salaris|cao|verhoging|stijging|toeslag)\\s*[^.?!]*?\\d[\\d.,]*\\s?%\\s*[^.?!]*?[.?!])',
        re.IGNORECASE
    )
    
    # Pas de regex direct toe op de onbewerkte tekst, net als in de notebook.
    sentences_with_percentage = percentage_pattern.findall(text)

    # Verwijder overtollige spaties en vervang de newline karakters in de gevonden zinnen.
    clean_sentences = [s.strip().replace('\\n', ' ').replace('\n', ' ') for s in sentences_with_percentage]
    
    if clean_sentences:
        print(f"[PROCESS LOG] {len(clean_sentences)} relevante zinnen gevonden voor AI-analyse.")
    else:
        print("[PROCESS LOG] WAARSCHUWING: Geen relevante zinnen gevonden na correcte regex en normalisatie.")
        
    return clean_sentences

def classify_with_deepseek(sentence, api_key, api_url, model_name, max_retries=3, delay=5):
    """
    Roept de API aan via OpenRouter om een zin te classificeren en om uitleg te vragen.
    """
    if not api_key:
        print("Fout: OpenRouter API-sleutel is leeg of niet ingesteld.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost/sakkal-cao-analyzer",
        "X-Title": "Team Sakkal CAO Analyzer"
    }
    
    system_prompt = """Je bent een expert in het analyseren van Nederlandse CAO-teksten. Je taak is om te bepalen of een zin concrete, definitieve loonstijgingen beschrijft en **alle** details daarvan te extraheren.

**Instructies:**
- Een zin kan **meerdere** loonstijgingen bevatten (bijv. in een opsomming). Je moet ze **allemaal** vinden.
- Classificeer alleen **daadwerkelijke, gegarandeerde afspraken** over salarisverhogingen als 'Loonstijging'.
- **Negeer** zinnen die beginnen met 'Rekenvoorbeeld', 'Voorbeeld:', 'Stel dat', of 'Berekening'.
- **Negeer** structurele salarisverschillen tussen functies (bv. 'Level 2 is 10% hoger dan Level 1').
- **Cruciaal: Negeer voorwaardelijke verhogingen** die afhankelijk zijn van een conditie (bv. 'tenzij', 'indien').
- **Cruciaal: Negeer vergelijkende berekeningen.** Als een stijging wordt beschreven 'ten opzichte van' een datum in het verleden, is dit een vergelijking, geen nieuwe afspraak.

**Jouw taak:**
Analyseer de zin en geef een JSON-object terug met DRIE sleutels:
1. 'classificatie': 'Loonstijging' of 'Geen Loonstijging'.
2. 'verhogingen': Een **lijst** van JSON-objecten. Elk object bevat 'datum' en 'percentage'. Als er geen gegarandeerde loonstijgingen zijn, moet deze lijst leeg zijn: `[]`.
3. 'uitleg': een korte, duidelijke toelichting op je keuze.

**BELANGRIJK:** Je antwoord MOET **uitsluitend** een enkel, geldig JSON-object zijn. Geen extra tekst."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "De salarissen stijgen met 2% op 01-01-2025 en met nog eens 3% op 01-07-2025."},
        {"role": "assistant", "content": '''{"classificatie": "Loonstijging", "verhogingen": [{"datum": "01/01/2025", "percentage": 2.0}, {"datum": "01/07/2025", "percentage": 3.0}], "uitleg": "De zin bevat twee concrete loonstijgingen."}'''},
        {"role": "user", "content": "Met ingang van 1 januari 2025 worden deze verlofdagen omgezet in een structurele salarisverhoging van 0,84% tenzij werkgever deze verlofdagen al eerder heeft omgezet."},
        {"role": "assistant", "content": '''{"classificatie": "Geen Loonstijging", "verhogingen": [], "uitleg": "De verhoging is voorwaardelijk vanwege de 'tenzij'-clausule en dus niet gegarandeerd."}'''},
        {"role": "user", "content": "het eindloon stijgt ten opzichte van het eindloon op 31 december 2024 met 6,9%."},
        {"role": "assistant", "content": '''{"classificatie": "Geen Loonstijging", "verhogingen": [], "uitleg": "Dit is een vergelijkende berekening ten opzichte van een referentiedatum, geen nieuwe loonafspraak met een ingangsdatum."}'''},
        {"role": "user", "content": sentence}
    ]

    data = { "model": model_name, "messages": messages, "response_format": { "type": "json_object" }, "max_tokens": 400, "temperature": 0.0 }
    
    for attempt in range(max_retries):
        try:
            print(f"[AI LOG] Attempt {attempt + 1}: Sending request to model '{model_name}'...")
            response = requests.post(api_url, json=data, headers=headers, timeout=45)
            print(f"[AI LOG] Received response with status code: {response.status_code}")
            
            # For debugging, always print the raw text
            raw_response_text = response.text
            print(f"[AI LOG] Raw AI Response:\\n---\\n{raw_response_text}\\n---")
            
            response.raise_for_status()
            
            try:
                content = response.text
                full_response_json = json.loads(content)
                message_content = full_response_json['choices'][0]['message']['content']
                
                start_index = message_content.rfind('{')
                end_index = message_content.rfind('}')
                
                if start_index != -1 and end_index != -1 and end_index > start_index:
                    json_str = message_content[start_index : end_index + 1]
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError as e:
                        print(f"Fout bij parsen van laatst gevonden JSON-object: {e}")
                        print(f"Geïsoleerde tekst: {json_str}")
                        return None
                else:
                    print("Geen JSON-object gevonden in de AI-respons.")
                    print(f"Ontvangen tekst: {message_content}")
                    return None
            except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
                print(f"Fout bij parsen van de volledige API-respons: {e}")
                print(f"Ontvangen tekst: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"Netwerkfout: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                return None
    
    print(f"Fout na {max_retries} pogingen.")
    return None

def analyze_pdfs(pdf_paths):
    """
    Orchestreert het volledige analyseproces voor een lijst van PDF-bestanden.
    """
    final_json_output = {}
    for pdf_path in pdf_paths:
        pdf_filename = os.path.basename(pdf_path)
        print("\\n" + "="*80)
        print(f"--- Begin analyse van: {pdf_filename} ---\\n")
        
        extracted_text = extract_text_from_pdf_with_ocr(pdf_path)
        if not extracted_text:
            print(f"Kon geen tekst extraheren uit {pdf_filename}. Bestand wordt overgeslagen.")
            final_json_output[pdf_filename] = {"error": "Tekstextractie mislukt", "verhogingen": []}
            continue

        sentences = extract_percentage_sentences(extracted_text)
        if not sentences:
            print(f"Geen relevante zinnen met percentages gevonden in {pdf_filename}.")
            final_json_output[pdf_filename] = {"error": "Geen relevante zinnen gevonden", "verhogingen": []}
            continue

        print(f"{len(sentences)} zinnen gevonden voor analyse.")
        
        all_found_increases = []
        print("\\n[PROCESS LOG] Beginnen met classificatie via DeepSeek API:")
        for i, sentence in enumerate(sentences):
            short_sentence = (sentence[:120] + '...') if len(sentence) > 120 else sentence
            print(f"\\n[PROCESS LOG] Verwerken zin {i+1}/{len(sentences)}: {short_sentence}")
            
            result_json = classify_with_deepseek(sentence, OPENROUTER_API_KEY, OPENROUTER_API_URL, MODEL_NAME)
            print(f"[PROCESS LOG] Parsed JSON from AI: {result_json}")
            
            if result_json:
                classificatie = result_json.get('classificatie', 'Onbekend')
                verhogingen = result_json.get('verhogingen', [])
                
                if classificatie == 'Loonstijging' and verhogingen:
                    print(f"  Resultaat: ✅ {len(verhogingen)} loonstijging(en) gevonden.")
                    all_found_increases.extend(verhogingen)
                else:
                    print(f"  Resultaat: ❌ Geen Loonstijging")
            else:
                print("  Resultaat: ❓ Fout bij het classificeren van de zin.")
            
            time.sleep(1)

        # Stap 4: Resultaten voor de huidige PDF groeperen en aggregeren
        grouped_increases = {}
        for increase in all_found_increases:
            datum = increase.get('datum')
            percentage_val = increase.get('percentage')

            # Controleer of de data valide is en niet 'N.v.t.'
            if datum and percentage_val and str(datum).lower() != 'n.v.t.' and str(percentage_val).lower() != 'n.v.t.':
                parsed_percentage = None
                # Probeer de waarde om te zetten naar een getal (float)
                if isinstance(percentage_val, (int, float)):
                    parsed_percentage = float(percentage_val)
                elif isinstance(percentage_val, str):
                    try:
                        # Maak de string schoon: verwijder '%' en vervang ',' door '.'
                        cleaned_val = percentage_val.strip().replace('%', '').replace(',', '.').strip()
                        if cleaned_val:  # Zorg dat er een waarde overblijft
                            parsed_percentage = float(cleaned_val)
                    except ValueError:
                        print(f"Waarschuwing: Kon percentage-string niet omzetten naar getal: '{percentage_val}'")
                        pass  # Sla over als conversie mislukt

                # Als de conversie succesvol was, voeg toe aan de lijst
                if parsed_percentage is not None:
                    if datum not in grouped_increases:
                        grouped_increases[datum] = []
                    grouped_increases[datum].append(parsed_percentage)

        aggregated_increases = []
        for datum, percentages in grouped_increases.items():
            # Sorteer percentages om de output voorspelbaar te maken
            percentages.sort()
            percentage_str = "/".join([f"{p:.2f}".replace('.', ',') + '%' for p in percentages])
            aggregated_increases.append({'datum': datum, 'percentage': percentage_str})
        
        def sort_key(item):
            try:
                return datetime.strptime(item.get('datum', ''), '%d/%m/%Y')
            except (ValueError, TypeError):
                return datetime.max
        aggregated_increases.sort(key=sort_key)
        
        final_json_output[pdf_filename] = {"verhogingen": aggregated_increases}
        print(f"\\nAnalyse voor {pdf_filename} voltooid.")
        
    return final_json_output

# --- Stap 2: Functie uit zebiexcel.ipynb (Excel Generatie) ---

def create_excel_summary(json_data, output_path):
    """
    Verwerkt de JSON-data en genereert een Excel-bestand.
    """
    processed_data = []
    for filename, data in json_data.items():
        row_data = {}
        row_data['Cao-code'] = filename[:4]
        
        increases = data.get('verhogingen', [])
        
        for i, increase in enumerate(increases):
            date_col_name = f"{i+1}e datum nieuwe cao"
            perc_col_name = f"{i+1}e percentage nieuwe cao"
            
            row_data[date_col_name] = increase.get('datum')
            row_data[perc_col_name] = increase.get('percentage')
            
        processed_data.append(row_data)

    column_order = ['Cao-code']
    for i in range(1, 8): # Maximaal 7 verhogingen
        column_order.append(f"{i}e datum nieuwe cao")
        column_order.append(f"{i}e percentage nieuwe cao")

    df = pd.DataFrame(processed_data)

    for col in column_order:
        if col not in df.columns:
            df[col] = None

    df = df[column_order]

    df.to_excel(output_path, index=False)
    print("\\n" + "="*80)
    print(f"Excel-bestand succesvol aangemaakt op: {output_path}")
    print("\\nVoorbeeld van de data:")
    print(df.head())

# --- Hoofd execution block ---

if __name__ == "__main__":
    # Definieer hier de lijst van te verwerken PDF-bestanden
    # Voorbeeld:
    # pdf_file_paths = [
    #     "/pad/naar/uw/cao1.pdf",
    #     "/pad/naar/uw/cao2.pdf"
    # ]
    pdf_file_paths = [] # Leeg laten om fouten te voorkomen bij directe executie
    
    if pdf_file_paths:
        # Voer het volledige proces uit
        analysis_results = analyze_pdfs(pdf_file_paths)
        
        print("\\n" + "="*80)
        print("--- Volledige JSON-output van de analyse: ---")
        print(json.dumps(analysis_results, indent=2, ensure_ascii=False))
        
        if analysis_results:
            # Geef een voorbeeld output-bestandsnaam
            create_excel_summary(analysis_results, "cao_samenvatting_voorbeeld.xlsx")
        else:
            print("\\nGeen resultaten om naar Excel te schrijven.")
    else:
        print("Het 'pdf_file_paths' is leeg. Voeg bestandspaden toe om het script te testen.") 