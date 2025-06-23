
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ResultsPreviewProps {
  originalData: any[][];
  processedData: any[][];
  columns: string[];
  selectedColumns: string[];
  filename: string;
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({
  originalData,
  processedData,
  columns,
  selectedColumns,
  filename
}) => {
  const handleDownload = () => {
    // In a real implementation, you would generate and download the actual Excel file
    // For this demo, we'll just show a success message
    toast.success(`Bestand "${filename.replace('.xlsx', '_processed.xlsx')}" wordt gedownload`);
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename.replace('.xlsx', '_processed.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mockProcessedData = originalData.map((row, rowIndex) => {
    return row.map((cell, colIndex) => {
      const columnName = columns[colIndex];
      if (selectedColumns.includes(columnName)) {
        // Simulate filled data
        if (columnName === 'Loonsverhogingspercentage') return '3.5%';
        if (columnName === 'Bonuspercentage') return '5%';
        if (columnName === 'Reiskosten') return '€ 250';
      }
      return cell;
    });
  });

  const changesCount = selectedColumns.length * originalData.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <Eye className="w-5 h-5" />
            <span>Verwerkingsresultaat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{originalData.length}</p>
              <p className="text-sm text-green-600">Rijen verwerkt</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{selectedColumns.length}</p>
              <p className="text-sm text-green-600">Kolommen gevuld</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{changesCount}</p>
              <p className="text-sm text-green-600">Cellen aangepast</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">Bestand klaar voor download</p>
              <p className="text-sm text-green-700">
                {filename.replace('.xlsx', '_processed.xlsx')}
              </p>
            </div>
            
            <Button 
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Gegevens Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="relative">
                      <div className="flex items-center space-x-2">
                        <span>{column}</span>
                        {selectedColumns.includes(column) && (
                          <Badge variant="secondary" className="text-xs">
                            Aangepast
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProcessedData.slice(0, 5).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, colIndex) => {
                      const columnName = columns[colIndex];
                      const isModified = selectedColumns.includes(columnName);
                      
                      return (
                        <TableCell 
                          key={colIndex}
                          className={`${
                            isModified 
                              ? 'bg-green-50 border-l-2 border-green-400 font-medium text-green-800' 
                              : ''
                          }`}
                        >
                          {cell}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {originalData.length > 5 && (
            <p className="text-sm text-gray-600 mt-4 text-center">
              Toont eerste 5 rijen van {originalData.length} totaal
            </p>
          )}
        </CardContent>
      </Card>

      {/* Changes Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Wijzigingen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedColumns.map((column) => (
              <div key={column} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-900">{column}</p>
                  <p className="text-sm text-blue-700">
                    {originalData.length} cellen gevuld
                  </p>
                </div>
                <Badge variant="outline" className="bg-white">
                  Voltooid
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPreview;
