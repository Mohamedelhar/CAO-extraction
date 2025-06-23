
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSpreadsheet, FileText, Cpu, Download, Plus } from 'lucide-react';
import ExcelUpload from '@/components/ExcelUpload';
import PDFUpload from '@/components/PDFUpload';
import AIProcessor from '@/components/AIProcessor';
import NewRowPreview from '@/components/NewRowPreview';
import LogViewer from '@/components/LogViewer';

interface ExcelData {
  filename: string;
  columns: string[];
  data: any[][];
}

interface ExtractedCAOData {
  [key: string]: string;
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
  const [pdfFile, setPDFFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCAOData | null>(null);
  const [newRowData, setNewRowData] = useState<any[]>([]);
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
    { number: 1, title: 'Upload Master Excel', icon: FileSpreadsheet, completed: !!excelData },
    { number: 2, title: 'Upload CAO PDF', icon: FileText, completed: !!pdfFile },
    { number: 3, title: 'AI Extractie', icon: Cpu, completed: !!extractedData },
    { number: 4, title: 'Nieuwe Rij Toevoegen', icon: Plus, completed: newRowData.length > 0 },
    { number: 5, title: 'Download Resultaat', icon: Download, completed: false }
  ];

  const handleExcelUpload = (data: ExcelData) => {
    setExcelData(data);
    addLog('Master Excel Upload', `Bestand "${data.filename}" geüpload met ${data.columns.length} kolommen als masterstructuur`, 'success');
    setCurrentStep(2);
  };

  const handlePDFUpload = (file: File) => {
    setPDFFile(file);
    addLog('CAO PDF Upload', `PDF bestand "${file.name}" succesvol geüpload (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
    setCurrentStep(3);
  };

  const handleDataExtracted = (data: ExtractedCAOData) => {
    setExtractedData(data);
    addLog('AI Extractie Voltooid', `${Object.keys(data).length} velden geëxtraheerd uit CAO PDF`, 'success');
    
    // Create new row based on extracted data
    if (excelData) {
      const newRow = excelData.columns.map(column => {
        const value = data[column] || 'Niet gevonden';
        return value;
      });
      
      // Add PDF filename as reference if there's a column for it
      const pdfColumnIndex = excelData.columns.findIndex(col => 
        col.toLowerCase().includes('bestand') || col.toLowerCase().includes('pdf')
      );
      if (pdfColumnIndex !== -1 && pdfFile) {
        newRow[pdfColumnIndex] = pdfFile.name;
      }
      
      setNewRowData(newRow);
      addLog('Nieuwe Rij Voorbereid', 'Geëxtraheerde data omgezet naar nieuwe rij format', 'success');
      setCurrentStep(4);
    }
  };

  const handleAddRow = () => {
    if (excelData && newRowData.length > 0) {
      const updatedData = [...excelData.data, newRowData];
      setExcelData({ ...excelData, data: updatedData });
      addLog('Rij Toegevoegd', 'Nieuwe rij succesvol toegevoegd aan Excel data', 'success');
      setCurrentStep(5);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CAO-Excel Integratie Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload uw master Excel-bestand en CAO PDF om automatisch nieuwe rijen toe te voegen met geëxtraheerde gegevens
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
                    <span>Stap 1: Upload Master Excel Bestand</span>
                    {excelData && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExcelUpload onUpload={handleExcelUpload} />
                </CardContent>
              </Card>
            )}

            {/* Step 2: PDF Upload */}
            {currentStep >= 2 && excelData && (
              <Card className={`transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Stap 2: Upload CAO PDF Bestand</span>
                    {pdfFile && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PDFUpload onUpload={handlePDFUpload} />
                </CardContent>
              </Card>
            )}

            {/* Step 3: AI Processing */}
            {currentStep >= 3 && pdfFile && excelData && (
              <Card className={`transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span>Stap 3: CAO Data Extractie</span>
                    {extractedData && <Badge variant="secondary">Voltooid</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIProcessor 
                    pdfFile={pdfFile}
                    excelColumns={excelData.columns}
                    onDataExtracted={handleDataExtracted}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: New Row Preview */}
            {currentStep >= 4 && extractedData && excelData && (
              <Card className={`transition-all duration-300 ${currentStep === 4 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span>Stap 4: Nieuwe Rij Voorvertoning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NewRowPreview 
                    columns={excelData.columns}
                    newRowData={newRowData}
                    extractedData={extractedData}
                    onAddRow={handleAddRow}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Download Results */}
            {currentStep >= 5 && excelData && (
              <Card className={`transition-all duration-300 ${currentStep === 5 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span>Stap 5: Download Bijgewerkt Excel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        Excel Bestand Bijgewerkt!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Nieuwe rij toegevoegd met CAO gegevens. Totaal aantal rijen: {excelData.data.length}
                      </p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
                        Download Bijgewerkt Excel
                      </button>
                    </div>
                  </div>
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
