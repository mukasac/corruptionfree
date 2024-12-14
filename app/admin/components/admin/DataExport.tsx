// components/admin/DataExport.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportConfig {
  filename: string;
  fields: {
    key: string;
    label: string;
    formatter?: (value: any) => any;
  }[];
}

interface DataExportProps {
  data: any[];
  config: ExportConfig;
  onExport?: () => void;
}

export function DataExport({ data, config, onExport }: DataExportProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Format data according to config
      const formattedData = data.map(item => {
        const row: Record<string, any> = {};
        config.fields.forEach(field => {
          const value = item[field.key];
          row[field.label] = field.formatter ? field.formatter(value) : value;
        });
        return row;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Generate file and trigger download
      XLSX.writeFile(wb, `${config.filename}.xlsx`);

      toast({
        title: "Success",
        description: "Data exported successfully"
      });

      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting || data.length === 0}
    >
      {exporting ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export
        </>
      )}
    </Button>
  );
}