
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Brain, FileSearch, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIProcessorProps {
  pdfFile: File;
  selectedColumns: string[];
  onDataExtracted: (data: any) => void;
}

const AIProcessor: React.FC<AIProcessorProps> = ({
  pdfFile,
  selectedColumns,
  onDataExtracted
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);

  const simulateAIProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Step 1: PDF Reading
    setCurrentStep('PDF bestand lezen...');
    setProgress(20);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Text Extraction
    setCurrentStep('Tekst extractie...');
    setProgress(40);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: AI Analysis
    setCurrentStep('AI analyse van de inhoud...');
    setProgress(60);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Data Mapping
    setCurrentStep('Gegevens koppelen aan kolommen...');
    setProgress(80);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Finalization
    setCurrentStep('Voltooien...');
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock extracted data
    const mockExtractedData = {
      'Loonsverhogingspercentage': '3.5%',
      'Reiskosten': '€ 0.23 per km',
      'Bonuspercentage': '5%'
    };

    setExtractedData(mockExtractedData);
    setIsProcessing(false);
    setCurrentStep('Voltooid!');
    
    toast.success('AI verwerking succesvol voltooid');
    onDataExtracted(mockExtractedData);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSearch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">PDF Document</h3>
                <p className="text-sm text-gray-600">{pdfFile.name}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Grootte: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Klaar voor AI verwerking</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Geselecteerde Kolommen</h3>
                <p className="text-sm text-gray-600">{selectedColumns.length} kolommen</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {selectedColumns.map((column) => (
                <div key={column} className="text-sm text-gray-600 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{column}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {!isProcessing && !extractedData && (
        <div className="text-center">
          <Button 
            onClick={simulateAIProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Cpu className="w-5 h-5 mr-2" />
            Start AI Verwerking
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            De AI zal het PDF document analyseren en relevante gegevens extraheren
          </p>
        </div>
      )}

      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-medium text-blue-900">AI Verwerking Actief</h3>
                <p className="text-sm text-blue-700">{currentStep}</p>
              </div>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <div className="text-sm text-blue-700">
              <p>{progress}% voltooid</p>
            </div>
          </CardContent>
        </Card>
      )}

      {extractedData && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Gegevens Geëxtraheerd</h3>
                <p className="text-sm text-green-700">Succesvol voltooid</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-green-900">Gevonden gegevens:</h4>
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-green-700 font-medium">{value as string}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">AI Verwerking Process:</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>PDF document wordt gelezen en geconverteerd naar tekst</li>
          <li>AI analyseert de content om relevante informatie te identificeren</li>
          <li>Gegevens worden gekoppeld aan de geselecteerde kolommen</li>
          <li>Resultaten worden voorbereid voor invoer in Excel</li>
        </ol>
      </div>
    </div>
  );
};

export default AIProcessor;
