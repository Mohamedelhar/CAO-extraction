# replit.nix
# Dit bestand vertelt Replit welke systeempakketten (buiten Python of Node.js)
# geïnstalleerd moeten worden.

{ pkgs }: {
  deps = [
    # Vereist voor OCR-functionaliteit
    pkgs.tesseract

    # Vereist voor het Nederlandse taalmodel voor Tesseract
    pkgs.tesseract_data_nld

    # Vereist voor de pdf2image bibliotheek (PDF naar afbeelding conversie)
    pkgs.poppler
  ];
} 