
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
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
      // In a real implementation, you would use a library like xlsx to parse the Excel file
      // For this demo, we'll simulate the parsing with mock data
      
      const mockColumns = [
        'Naam', 'Functie', 'Salaris', 'Loonsverhogingspercentage', 
        'Reiskosten', 'Bonuspercentage', 'Startdatum', 'Afdeling'
      ];
      
      const mockData = [
        ['Jan Jansen', 'Developer', '€ 3500', '', '€ 200', '', '2023-01-15', 'IT'],
        ['Marie de Boer', 'Manager', '€ 4500', '', '€ 300', '', '2022-03-20', 'HR'],
        ['Piet Smit', 'Analyst', '€ 3200', '', '€ 150', '', '2023-06-01', 'Finance'],
        ['Lisa van Dijk', 'Designer', '€ 3800', '', '€ 180', '', '2022-11-10', 'Marketing'],
        ['Tom Bakker', 'Developer', '€ 3600', '', '€ 220', '', '2023-04-05', 'IT']
      ];

      const excelData: ExcelData = {
        filename: file.name,
        columns: mockColumns,
        data: mockData
      };

      toast.success(`Excel bestand "${file.name}" succesvol geladen`);
      onUpload(excelData);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Fout bij het verwerken van het Excel bestand');
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
            <p className="text-blue-600 font-medium">Laat het Excel bestand hier vallen...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                Sleep uw Excel bestand hier naartoe of klik om te selecteren
              </p>
              <p className="text-sm text-gray-400">
                Ondersteunde formaten: .xlsx, .xls
              </p>
            </div>
          )}
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Selecteer Bestand</span>
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Tip:</p>
            <p>Zorg ervoor dat uw Excel bestand headers in de eerste rij heeft en dat de data gestructureerd is.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
