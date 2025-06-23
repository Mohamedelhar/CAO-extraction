
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PDFUploadProps {
  onUpload: (file: File) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      toast.success(`PDF bestand "${file.name}" succesvol geladen`);
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-red-100' : 'bg-gray-100'}`}>
            <FileText className={`w-8 h-8 ${isDragActive ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          
          {isDragActive ? (
            <p className="text-red-600 font-medium">Laat het PDF bestand hier vallen...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                Sleep uw PDF bestand hier naartoe of klik om te selecteren
              </p>
              <p className="text-sm text-gray-400">
                Ondersteund formaat: .pdf
              </p>
            </div>
          )}
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Selecteer PDF</span>
          </Button>
        </div>
      </div>

      {acceptedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              {acceptedFiles[0].name}
            </span>
            <span className="text-green-600 text-sm">
              ({(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Tips voor beste resultaten:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Gebruik PDF's met duidelijke, leesbare tekst</li>
              <li>Zorg dat belangrijke gegevens niet in afbeeldingen staan</li>
              <li>Gestructureerde documenten (zoals CAO's, contracten) werken het beste</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;
