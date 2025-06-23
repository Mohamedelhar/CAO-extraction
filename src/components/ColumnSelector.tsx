
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Columns } from 'lucide-react';
import { toast } from 'sonner';

interface ColumnSelectorProps {
  columns: string[];
  selectedColumns: string[];
  onColumnsSelected: (columns: string[]) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onColumnsSelected
}) => {
  const handleColumnToggle = (column: string) => {
    const updatedColumns = selectedColumns.includes(column)
      ? selectedColumns.filter(col => col !== column)
      : [...selectedColumns, column];
    
    onColumnsSelected(updatedColumns);
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      onColumnsSelected([]);
    } else {
      onColumnsSelected(columns);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedColumns.length === 0) {
      toast.error('Selecteer tenminste één kolom');
      return;
    }
    toast.success(`${selectedColumns.length} kolommen geselecteerd`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Columns className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            Selecteer kolommen voor automatische invulling
          </h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="text-sm"
        >
          {selectedColumns.length === columns.length ? 'Deselecteer Alles' : 'Selecteer Alles'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {columns.map((column) => {
          const isSelected = selectedColumns.includes(column);
          
          return (
            <Card 
              key={column}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleColumnToggle(column)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={isSelected}
                    onChange={() => handleColumnToggle(column)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {column}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedColumns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                {selectedColumns.length} kolom{selectedColumns.length !== 1 ? 'men' : ''} geselecteerd
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedColumns.join(', ')}
              </p>
            </div>
            
            <Button onClick={handleConfirmSelection} className="ml-4">
              Doorgaan naar PDF Upload
            </Button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <p className="font-medium mb-2">Instructies:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Selecteer de kolommen waarin de AI automatisch gegevens moet invullen</li>
          <li>De gegevens worden gehaald uit het PDF-document dat u in de volgende stap uploadt</li>
          <li>U kunt meerdere kolommen tegelijk selecteren</li>
        </ul>
      </div>
    </div>
  );
};

export default ColumnSelector;
