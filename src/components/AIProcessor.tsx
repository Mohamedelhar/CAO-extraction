
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Brain, FileSearch, CheckCircle2, Loader2, List } from 'lucide-react';
import { toast } from 'sonner';

interface AIProcessorProps {
  pdfFile: File;
  excelColumns: string[];
  onDataExtracted: (data: { [key: string]: string }) => void;
}

const AIProcessor: React.FC<AIProcessorProps> = ({
  pdfFile,
  excelColumns,
  onDataExtracted
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractedData, setExtractedData] = useState<{ [key: string]: string } | null>(null);

  const simulateCAOExtraction = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Step 1: PDF Reading
    setCurrentStep('CAO PDF document inlezen...');
    setProgress(15);
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Step 2: Text Extraction
    setCurrentStep('Tekst extractie uit CAO document...');
    setProgress(30);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: AI Analysis
    setCurrentStep('AI analyse van CAO inhoud...');
    setProgress(50);
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Step 4: Data Mapping
    setCurrentStep('Koppeling gegevens aan Excel kolommen...');
    setProgress(75);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 5: Validation
    setCurrentStep('Validatie geëxtraheerde gegevens...');
    setProgress(90);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 6: Finalization
    setCurrentStep('Voltooien extractie...');
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock CAO extracted data based on common CAO fields
    const mockCAOData: { [key: string]: string } = {};
    
    excelColumns.forEach(column => {
      const columnLower = column.toLowerCase();
      
      if (columnLower.includes('cao_naam') || columnLower.includes('naam')) {
        mockCAOData[column] = 'CAO Zorgverzekeraars 2024-2026';
      } else if (columnLower.includes('datum') && columnLower.includes('akkoord')) {
        mockCAOData[column] = '2024-03-15';
      } else if (columnLower.includes('geldigheidsduur')) {
        mockCAOData[column] = '1 april 2024 t/m 31 maart 2026';
      } else if (columnLower.includes('loonsverhogingen') && columnLower.includes('2024')) {
        mockCAOData[column] = '3.8% per 1 april 2024';
      } else if (columnLower.includes('loonsverhogingen') && columnLower.includes('2025')) {
        mockCAOData[column] = '2.5% per 1 april 2025';
      } else if (columnLower.includes('loonsverhogingen') && columnLower.includes('2026')) {
        mockCAOData[column] = '2.2% per 1 april 2026';
      } else if (columnLower.includes('loonparagraaf') || columnLower.includes('volledige_loon')) {
        mockCAOData[column] = 'Artikel 15: Salarissen worden verhoogd conform afgesproken percentages. Minimumschalen gelden voor alle functies...';
      } else if (columnLower.includes('reiskosten')) {
        mockCAOData[column] = '€0.22 per kilometer vanaf 1 april 2024';
      } else if (columnLower.includes('thuiswerk')) {
        mockCAOData[column] = '€3.00 per thuiswerkdag, maximaal 3 dagen per week';
      } else if (columnLower.includes('overwerk')) {
        mockCAOData[column] = 'Overwerk boven 40 uur per week wordt vergoed tegen 150% van het reguliere loon';
      } else if (columnLower.includes('eenmalige') && columnLower.includes('2024')) {
        mockCAOData[column] = '€650 bruto uitkering in november 2024';
      } else if (columnLower.includes('eenmalige') && columnLower.includes('2025')) {
        mockCAOData[column] = '€400 bruto uitkering in december 2025';
      } else if (columnLower.includes('ai') || columnLower.includes('technologie')) {
        mockCAOData[column] = 'Artikel 32: Bij implementatie van AI-systemen wordt de OR geraadpleegd. Scholing wordt aangeboden...';
      } else if (columnLower.includes('rvu')) {
        mockCAOData[column] = 'Flexibele RVU-opbouw vanaf 62 jaar, maximaal 70% van jaarsalaris';
      } else if (columnLower.includes('volledige') && columnLower.includes('cao')) {
        mockCAOData[column] = 'Volledige CAO tekst van 156 pagina\'s beschikbaar via www.zorgverzekeraars.nl/cao';
      } else if (columnLower.includes('pdf') || columnLower.includes('bestand')) {
        mockCAOData[column] = pdfFile.name;
      } else {
        // For unknown columns, mark as not found
        mockCAOData[column] = 'Niet gevonden';
      }
    });

    setExtractedData(mockCAOData);
    setIsProcessing(false);
    setCurrentStep('CAO extractie voltooid!');
    
    toast.success('CAO gegevens succesvol geëxtraheerd');
    onDataExtracted(mockCAOData);
  };

  const foundFields = extractedData ? Object.entries(extractedData).filter(([_, value]) => value !== 'Niet gevonden').length : 0;
  const totalFields = excelColumns.length;

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
                <h3 className="font-medium text-gray-900">CAO PDF Document</h3>
                <p className="text-sm text-gray-600">{pdfFile.name}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Grootte: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Klaar voor CAO data extractie</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <List className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Te Extraheren Velden</h3>
                <p className="text-sm text-gray-600">{excelColumns.length} kolommen</p>
              </div>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {excelColumns.slice(0, 8).map((column) => (
                <div key={column} className="text-sm text-gray-600 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="truncate">{column}</span>
                </div>
              ))}
              {excelColumns.length > 8 && (
                <p className="text-xs text-gray-500">+ {excelColumns.length - 8} meer...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!isProcessing && !extractedData && (
        <div className="text-center">
          <Button 
            onClick={simulateCAOExtraction}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Brain className="w-5 h-5 mr-2" />
            Start CAO Data Extractie
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            AI zal alle relevante CAO gegevens extraheren op basis van de Excel kolomstructuur
          </p>
        </div>
      )}

      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-medium text-blue-900">CAO Data Extractie Actief</h3>
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
                <h3 className="font-medium text-green-900">CAO Gegevens Geëxtraheerd</h3>
                <p className="text-sm text-green-700">
                  {foundFields} van {totalFields} velden succesvol gevonden
                </p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className={`bg-white rounded-lg p-3 border ${
                  value === 'Niet gevonden' ? 'border-amber-200' : 'border-green-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900 text-sm mr-2">{key}</span>
                    <span className={`text-sm font-medium ${
                      value === 'Niet gevonden' ? 'text-amber-700' : 'text-green-700'
                    }`}>
                      {value.length > 60 ? value.substring(0, 60) + '...' : value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">CAO Extractie Process:</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>PDF document wordt geanalyseerd op CAO-specifieke inhoud</li>
          <li>AI herkent loonafspraken, vergoedingen en andere CAO elementen</li>
          <li>Gegevens worden gekoppeld aan de Excel kolomstructuur</li>
          <li>Ontbrekende informatie wordt gemarkeerd voor handmatige controle</li>
        </ol>
      </div>
    </div>
  );
};

export default AIProcessor;
