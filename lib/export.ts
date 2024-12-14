// lib/export.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportConfig {
  filename: string;
  fields: {
    key: string;
    label: string;
    formatter?: (value: any) => any;
  }[];
}

export class ExportHandler {
  private static formatters = {
    date: (value: string) => new Date(value).toLocaleDateString(),
    currency: (value: number) => value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    }),
    number: (value: number) => value.toLocaleString(),
    percentage: (value: number) => `${(value * 100).toFixed(1)}%`
  };

  static async exportToExcel(data: any[], config: ExportConfig) {
    const formattedData = data.map(item => {
      const row: Record<string, any> = {};
      config.fields.forEach(field => {
        const value = item[field.key];
        row[field.label] = field.formatter ? field.formatter(value) : value;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${config.filename}.xlsx`);
  }

  static async exportToCsv(data: any[], config: ExportConfig) {
    const formattedData = data.map(item => {
      return config.fields.map(field => {
        const value = item[field.key];
        return field.formatter ? field.formatter(value) : value;
      }).join(',');
    });

    const headers = config.fields.map(field => field.label).join(',');
    const csv = [headers, ...formattedData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${config.filename}.csv`);
  }

  static async exportToPdf(data: any[], config: ExportConfig) {
    // Implement PDF export using a library like pdfmake
    // This is a placeholder for PDF export functionality
  }
}

// Example usage:
export const nomineeExportConfig: ExportConfig = {
  filename: 'nominees-export',
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'position', label: 'Position' },
    { key: 'institution', label: 'Institution' },
    { 
      key: 'averageRating', 
      label: 'Average Rating',
      formatter: (value) => value.toFixed(2)
    },
    { 
      key: 'createdAt', 
      label: 'Submission Date',
      formatter: ExportHandler.formatters.date
    },
    { key: 'status', label: 'Status' }
  ]
};

export const institutionExportConfig: ExportConfig = {
  filename: 'institutions-export',
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { 
      key: 'totalRatings', 
      label: 'Total Ratings',
      formatter: ExportHandler.formatters.number
    },
    { 
      key: 'averageRating', 
      label: 'Average Rating',
      formatter: (value) => value.toFixed(2)
    },
    { key: 'status', label: 'Status' },
    { 
      key: 'createdAt', 
      label: 'Registration Date',
      formatter: ExportHandler.formatters.date
    }
  ]
};