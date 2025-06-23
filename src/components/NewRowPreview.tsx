
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle2, AlertTriangle, Eye, Table as TableIcon } from 'lucide-react';
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

      {/* Complete Row Preview as Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Volledige Rij Voorvertoning
              </h3>
            </div>
            <Badge variant="outline" className="text-sm">
              {newRowData.length > 0 ? 'Gereed voor toevoeging' : 'Wordt voorbereid'}
            </Badge>
          </div>
          
          <ScrollArea className="h-96 w-full">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="min-w-48">Kolom Naam</TableHead>
                    <TableHead className="min-w-64">Geëxtraheerde Waarde</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column, index) => {
                    const value = newRowData[index] || 'Niet gevonden';
                    const isFound = value !== 'Niet gevonden';
                    
                    return (
                      <TableRow 
                        key={column}
                        className={`transition-colors ${
                          isFound ? 'bg-green-50 hover:bg-green-100' : 'bg-amber-50 hover:bg-amber-100'
                        }`}
                      >
                        <TableCell className="text-center text-sm text-gray-500 font-medium">
                          {index + 1}
                        </TableCell>
                        
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center space-x-2">
                            {isFound ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            )}
                            <span className="break-words">{column}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className={`text-sm p-2 rounded border max-w-md ${
                            isFound 
                              ? 'bg-white border-green-200 text-gray-700' 
                              : 'bg-amber-100 border-amber-300 text-amber-800'
                          }`}>
                            {value.length > 150 ? (
                              <details className="group">
                                <summary className="cursor-pointer hover:text-blue-600">
                                  {value.substring(0, 150)}...
                                  <span className="ml-2 text-blue-600 group-open:hidden">
                                    [Toon meer]
                                  </span>
                                  <span className="ml-2 text-blue-600 hidden group-open:inline">
                                    [Toon minder]
                                  </span>
                                </summary>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  {value}
                                </div>
                              </details>
                            ) : (
                              <span className="break-words">{value}</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge 
                            variant={isFound ? "default" : "secondary"}
                            className={`text-xs ${
                              isFound 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            {isFound ? 'Gevonden' : 'Ontbreekt'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
          <li>Klik op "[Toon meer]" bij lange teksten om de volledige inhoud te zien</li>
        </ul>
      </div>
    </div>
  );
};

export default NewRowPreview;
