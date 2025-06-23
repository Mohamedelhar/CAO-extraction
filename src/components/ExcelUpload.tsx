
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

interface ExcelData {
  filename: string;
  columns: string[];
  data: any[][];
}

interface ExcelUploadProps {
  onUpload: (data: ExcelData) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUpload }) => {
  const processExcelFile = useCallback(async (file: File) => {
    try {
      // Mock data representing a CAO master Excel structure
      const caoMasterColumns = [
        'CAO_Naam', 'Datum_Akkoord', 'Geldigheidsduur', 
        'Loonsverhogingen_2024', 'Loonsverhogingen_2025', 'Loonsverhogingen_2026',
        'Volledige_Loonparagraaf', 'Reiskosten_Vergoeding', 'Thuiswerk_Vergoeding',
        'Overwerk_Jurisprudentie', 'Eenmalige_Uitkering_2024', 'Eenmalige_Uitkering_2025',
        'AI_Technologie_Paragraaf', 'RVU_Regelingen', 'Volledige_CAO_Tekst', 'PDF_Bestandsnaam'
      ];
      
      const existingData = [
        ['CAO Metaal', '2024-01-15', '2024-2026', '3.2%', '2.8%', '2.5%', 'Minimumloonstijging volgens...', '€0.21/km', '€2.50/dag', 'Overwerk na 40u/week...', '€500', '€300', 'AI-ontwikkelingen worden...', 'Flexibele opbouw...', 'Volledige CAO tekst hier...', 'cao_metaal_2024.pdf'],
        ['CAO Bouw', '2024-02-20', '2024-2025', '4.1%', '3.0%', '', 'Loonschalen worden...', '€0.23/km', '€3.00/dag', 'Overwerk boven normale...', '€750', '', 'Digitalisering speelt...', 'Standaard RVU...', 'Volledige tekst bouw CAO...', 'cao_bouw_2024.pdf']
      ];

      const excelData: ExcelData = {
        filename: file.name,
        columns: caoMasterColumns,
        data: existingData
      };

      toast.success(`Master Excel "${file.name}" succesvol geladen met ${caoMasterColumns.length} kolommen`);
      onUpload(excelData);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Fout bij het verwerken van het Master Excel bestand');
    }
  }, [onUpload]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <FileSpreadsheet className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Laat het Master Excel bestand hier vallen...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                Sleep uw Master Excel bestand hier naartoe of klik om te selecteren
              </p>
              <p className="text-sm text-gray-400">
                Dit bestand bepaalt de structuur voor CAO data extractie
              </p>
            </div>
          )}
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Selecteer Master Excel</span>
          </Button>
        </div>
      </div>

      {acceptedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              {acceptedFiles[0].name}
            </span>
            <span className="text-green-600 text-sm">
              ({(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Master Excel Structuur:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>De kolomnamen bepalen welke CAO gegevens worden geëxtraheerd</li>
              <li>Elke nieuwe PDF wordt als een nieuwe rij toegevoegd</li>
              <li>Ontbrekende gegevens worden gemarkeerd als "Niet gevonden"</li>
              <li>PDF bestandsnaam wordt automatisch toegevoegd als referentie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
