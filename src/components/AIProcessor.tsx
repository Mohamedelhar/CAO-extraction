import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Download, Brain } from 'lucide-react';
import { toast } from 'sonner';

// Gebruik de omgevingsvariabele voor de API URL, met localhost als fallback voor lokale ontwikkeling.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface AIProcessorProps {
  pdfFiles: File[];
  onProcessingComplete: () => void;
  onReset: () => void;
  addLog: (action: string, details: string, status?: 'success' | 'error' | 'info') => void;
}

const AIProcessor = ({ pdfFiles, onProcessingComplete, onReset, addLog }: AIProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startProcessing = async () => {
    setIsProcessing(true);
    addLog('Simulatie Gestart', 'De AI-verwerking wordt nu gesimuleerd.', 'info');
    
    // Hardcoded simulatie voor de presentatie
    addLog('AI Analyse', 'Stap 1/3: PDF-tekst extraheren...', 'info');

    // Wacht 45 seconden
    await new Promise(resolve => setTimeout(resolve, 45000));
    addLog('AI Analyse', 'Stap 2/3: Loonstijgingen classificeren met AI-model...', 'success');

    // Wacht nog 60 seconden
    await new Promise(resolve => setTimeout(resolve, 60000));
    addLog('AI Analyse', 'Stap 3/3: Excel-bestand genereren...', 'success');
    
    // Wacht de laatste 15 seconden (totaal 2 minuten)
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Maak een downloadlink voor het hardcoded bestand in de /public map
    // In een live scenario zou dit van de *backend* komen.
    const link = document.createElement('a');
    link.href = '/cao_samenvatting.xlsx'; // Pad blijft relatief aan de public map
    link.setAttribute('download', 'cao_samenvatting_gegenereerd.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Verwerking voltooid!", {
      description: "Het Excel-bestand wordt nu gedownload.",
    });

    setIsProcessing(false);
    setIsComplete(true);
    onProcessingComplete();
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-green-50">
        <Download className="w-10 h-10 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold text-green-800">Download Voltooid</h3>
        <p className="text-sm text-green-700 mb-6">Het Excel-bestand is succesvol gedownload.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Opnieuw Beginnen
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        {pdfFiles.length} PDF-bestand(en) zijn klaar voor analyse. Klik op 'Start Verwerking' om de AI aan het werk te zetten.
      </p>
      <Button 
        onClick={startProcessing} 
        disabled={isProcessing}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verwerken...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Start Analyse & Genereer Excel
          </>
        )}
      </Button>
    </div>
  );
};

export default AIProcessor;
