
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSpreadsheet, FileText, Cpu, Download } from 'lucide-react';
import ExcelUpload from '@/components/ExcelUpload';
import ColumnSelector from '@/components/ColumnSelector';
import PDFUpload from '@/components/PDFUpload';
import AIProcessor from '@/components/AIProcessor';
import ResultsPreview from '@/components/ResultsPreview';
import LogViewer from '@/components/LogViewer';

interface ExcelData {
  filename: string;
  columns: string[];
  data: any[][];
}

interface ProcessingLog {
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'info';
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [pdfFile, setPDFFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [processedData, setProcessedData] = useState<any[][]>([]);
  const [logs, setLogs] = useState<ProcessingLog[]>([]);

  const addLog = (action: string, details: string, status: 'success' | 'error' | 'info' = 'info') => {
    const log: ProcessingLog = {
      timestamp: new Date().toLocaleString(),
      action,
      details,
      status
    };
    setLogs(prev => [...prev, log]);
  };

  const steps = [
    { number: 1, title: 'Upload Excel', icon: FileSpreadsheet, completed: !!excelData },
    { number: 2, title: 'Selecteer Kolommen', icon: CheckCircle2, completed: selectedColumns.length > 0 },
    { number: 3, title: 'Upload PDF', icon: FileText, completed: !!pdfFile },
    { number: 4, title: 'AI Verwerking', icon: Cpu, completed: !!extractedData },
    { number: 5, title: 'Download Resultaat', icon: Download, completed: processedData.length > 0 }
  ];

  const handleExcelUpload = (data: ExcelData) => {
    setExcelData(data);
    addLog('Excel Upload', `Bestand "${data.filename}" succesvol geüpload met ${data.columns.length} kolommen`, 'success');
    setCurrentStep(2);
  };

  const handleColumnsSelected = (columns: string[]) => {
    setSelectedColumns(columns);
    addLog('Kolom Selectie', `${columns.length} kolommen geselecteerd: ${columns.join(', ')}`, 'success');
    setCurrentStep(3);
  };

  const handlePDFUpload = (file: File) => {
    setPDFFile(file);
    addLog('PDF Upload', `PDF bestand "${file.name}" succesvol geüpload (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
    setCurrentStep(4);
  };

  const handleDataExtracted = (data: any) => {
    setExtractedData(data);
    addLog('AI Extractie', 'Gegevens succesvol geëxtraheerd uit PDF document', 'success');
    
    // Simulate data processing
    const mockProcessedData = excelData?.data.map(row => [...row]) || [];
    setProcessedData(mockProcessedData);
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Excel-PDF Integratie Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload uw Excel-bestand, selecteer kolommen, upload een PDF en laat AI de gegevens automatisch invullen
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm p-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = step.completed;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Excel Upload */}
            {currentStep >= 1 && (
              <Card className={`transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <span>Stap 1: Upload Excel Bestand</span>
                    {excelData && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExcelUpload onUpload={handleExcelUpload} />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Column Selection */}
            {currentStep >= 2 && excelData && (
              <Card className={`transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span>Stap 2: Selecteer Kolommen</span>
                    {selectedColumns.length > 0 && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ColumnSelector 
                    columns={excelData.columns}
                    selectedColumns={selectedColumns}
                    onColumnsSelected={handleColumnsSelected}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: PDF Upload */}
            {currentStep >= 3 && selectedColumns.length > 0 && (
              <Card className={`transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Stap 3: Upload PDF Bestand</span>
                    {pdfFile && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PDFUpload onUpload={handlePDFUpload} />
                </CardContent>
              </Card>
            )}

            {/* Step 4: AI Processing */}
            {currentStep >= 4 && pdfFile && (
              <Card className={`transition-all duration-300 ${currentStep === 4 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span>Stap 4: AI Verwerking</span>
                    {extractedData && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIProcessor 
                    pdfFile={pdfFile}
                    selectedColumns={selectedColumns}
                    onDataExtracted={handleDataExtracted}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Results */}
            {currentStep >= 5 && extractedData && (
              <Card className={`transition-all duration-300 ${currentStep === 5 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span>Stap 5: Download Resultaat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultsPreview 
                    originalData={excelData?.data || []}
                    processedData={processedData}
                    columns={excelData?.columns || []}
                    selectedColumns={selectedColumns}
                    filename={excelData?.filename || 'processed_file.xlsx'}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar with Logs */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Verwerkingslog</CardTitle>
              </CardHeader>
              <CardContent>
                <LogViewer logs={logs} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
