from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import uuid
import json # for pretty printing
from process_pdfs import analyze_pdfs, create_excel_summary

print("--- Flask server script starting ---")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

print("--- Flask app configured ---")

@app.route('/api/process', methods=['POST'])
def process_uploaded_pdfs():
    print("\\n[SERVER LOG] Received new request for /api/process")
    
    if 'files' not in request.files:
        print("[SERVER LOG] ERROR: 'files' not in request.files")
        return jsonify({"error": "Geen bestanden meegegeven in de request"}), 400

    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        print("[SERVER LOG] ERROR: No files selected")
        return jsonify({"error": "Geen bestanden geselecteerd"}), 400

    print(f"[SERVER LOG] Received {len(files)} file(s): {[f.filename for f in files]}")

    request_id = str(uuid.uuid4())
    request_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], request_id)
    os.makedirs(request_upload_dir, exist_ok=True)
    print(f"[SERVER LOG] Created temporary directory: {request_upload_dir}")

    saved_file_paths = []
    for file in files:
        filepath = os.path.join(request_upload_dir, file.filename)
        file.save(filepath)
        saved_file_paths.append(filepath)
    print(f"[SERVER LOG] Saved files to: {saved_file_paths}")

    try:
        print("[SERVER LOG] --- Starting PDF Analysis ---")
        analysis_results = analyze_pdfs(saved_file_paths)
        print("[SERVER LOG] --- PDF Analysis Complete ---")
        
        print("[SERVER LOG] Full analysis result:")
        print(json.dumps(analysis_results, indent=2, ensure_ascii=False))

        if not analysis_results or all(not v.get('verhogingen') for v in analysis_results.values()):
            print("[SERVER LOG] WARNING: Analysis resulted in no usable data.")
            return jsonify({"error": "Analyse van PDF's heeft geen bruikbare loonsverhogingen opgeleverd."}), 500

        print("[SERVER LOG] --- Creating Excel Summary ---")
        output_excel_filename = f"cao_samenvatting_{request_id}.xlsx"
        output_excel_path = os.path.join(request_upload_dir, output_excel_filename)
        create_excel_summary(analysis_results, output_excel_path)
        print(f"[SERVER LOG] --- Excel Summary Created at {output_excel_path} ---")

        print("[SERVER LOG] Sending file to client...")
        return send_file(
            output_excel_path,
            as_attachment=True,
            download_name='cao_samenvatting.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        print(f"[SERVER LOG] !!! UNEXPECTED ERROR during processing: {e} !!!")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Er is een onverwachte serverfout opgetreden: {e}"}), 500
    
    finally:
        print(f"[SERVER LOG] Cleaning up temporary files for request {request_id}")
        for path in saved_file_paths:
            try:
                os.remove(path)
            except OSError as e:
                print(f"[SERVER LOG] Cleanup Error: Failed to remove file {path}: {e}")
        
        try:
            os.rmdir(request_upload_dir)
        except OSError as e:
            print(f"[SERVER LOG] Cleanup Error: Failed to remove directory {request_upload_dir}: {e}")
        print(f"[SERVER LOG] Request {request_id} finished.")


if __name__ == '__main__':
    print("--- Starting Flask server in debug mode ---")
    app.run(debug=True, port=5001) 