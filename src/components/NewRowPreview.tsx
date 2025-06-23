
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface NewRowPreviewProps {
  columns: string[];
  newRowData: any[];
  extractedData: { [key: string]: string };
  onAddRow: () => void;
}

const NewRowPreview: React.FC<NewRowPreviewProps> = ({
  columns,
  newRowData,
  extractedData,
  onAddRow
}) => {
  const successfulFields = newRowData.filter(value => value !== 'Niet gevonden').length;
  const missingFields = newRowData.filter(value => value === 'Niet gevonden').length;

  const handleAddRow = () => {
    if (successfulFields === 0) {
      toast.error('Geen gegevens gevonden om toe te voegen');
      return;
    }
    
    onAddRow();
    toast.success(`Nieuwe rij toegevoegd met ${successfulFields} ingevulde velden`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Gevonden</p>
                <p className="text-2xl font-bold text-green-700">{successfulFields}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">Niet Gevonden</p>
                <p className="text-2xl font-bold text-amber-700">{missingFields}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Totaal Velden</p>
                <p className="text-2xl font-bold text-blue-700">{columns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Row Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Voorvertoning Nieuwe Rij
            </h3>
            <Badge variant="outline" className="text-sm">
              Rij {newRowData.length > 0 ? 'gereed voor toevoeging' : 'wordt voorbereid'}
            </Badge>
          </div>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {columns.map((column, index) => {
                const value = newRowData[index] || 'Niet gevonden';
                const isFound = value !== 'Niet gevonden';
                
                return (
                  <div
                    key={column}
                    className={`border rounded-lg p-4 transition-colors ${
                      isFound ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {isFound ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          )}
                          <h4 className="font-medium text-gray-900 truncate">{column}</h4>
                        </div>
                        
                        <div className={`text-sm p-2 rounded border ${
                          isFound 
                            ? 'bg-white border-green-200 text-gray-700' 
                            : 'bg-amber-100 border-amber-300 text-amber-800'
                        }`}>
                          {value.length > 100 ? (
                            <>
                              <span>{value.substring(0, 100)}...</span>
                              <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs">
                                Toon meer
                              </button>
                            </>
                          ) : (
                            value
                          )}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={isFound ? "default" : "secondary"}
                        className={isFound ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                      >
                        {isFound ? 'Gevonden' : 'Ontbreekt'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div>
          <h3 className="font-medium text-blue-900 mb-1">
            Klaar om toe te voegen?
          </h3>
          <p className="text-sm text-blue-700">
            {successfulFields > 0 
              ? `${successfulFields} velden worden toegevoegd, ${missingFields} blijven leeg`
              : 'Geen gegevens gevonden om toe te voegen'
            }
          </p>
        </div>
        
        <Button 
          onClick={handleAddRow}
          disabled={successfulFields === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Voeg Rij Toe aan Excel
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Opmerking:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Velden gemarkeerd als "Niet gevonden" kunnen later handmatig worden ingevuld</li>
          <li>De PDF bestandsnaam wordt automatisch toegevoegd als referentie</li>
          <li>U kunt meerdere PDF's na elkaar verwerken om meer rijen toe te voegen</li>
        </ul>
      </div>
    </div>
  );
};

export default NewRowPreview;
