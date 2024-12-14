// app/admin/components/DataImport.tsx
import React, { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { z } from 'zod';

interface ImportError {
  row: number;
  column: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  data: any[];
}

// Validation schemas
const nomineeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  position: z.string().min(2, "Position is required"),
  institution: z.string().min(2, "Institution is required"),
  district: z.string().min(2, "District is required"),
  evidence: z.string().min(10, "Evidence must be at least 10 characters")
});

const institutionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["GOVERNMENT", "PARASTATAL", "AGENCY", "CORPORATION"]),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export default function DataImport({ 
  type,
  onClose,
  onImportComplete 
}: { 
  type: 'nominees' | 'institutions';
  onClose: () => void;
  onImportComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateData = async (data: any[]): Promise<ValidationResult> => {
    const errors: ImportError[] = [];
    const validData: any[] = [];

    const schema = type === 'nominees' ? nomineeSchema : institutionSchema;

    data.forEach((row, index) => {
      try {
        schema.parse(row);
        validData.push(row);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row: index + 2, // +2 because of header row and 0-based index
              column: err.path.join('.'),
              message: err.message
            });
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      data: validData
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const result = await validateData(data);
        setValidationResult(result);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const headers = type === 'nominees' 
      ? ['name', 'title', 'position', 'institution', 'district', 'evidence']
      : ['name', 'type', 'description', 'website'];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${type}-template.xlsx`);
  };

  const handleImport = async () => {
    if (!validationResult?.data) return;

    setImporting(true);
    let imported = 0;

    try {
      for (const item of validationResult.data) {
        await fetch(`/api/admin/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });

        imported++;
        setProgress((imported / validationResult.data.length) * 100);
      }

      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-[600px] max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Import {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {/* Template Download */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Download Template</h3>
            <p className="text-sm text-gray-600 mb-3">
              Use our template to ensure your data is formatted correctly
            </p>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">
                {file 
                  ? file.name 
                  : "Drop your file here or click to browse"
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports Excel and CSV files
              </p>
            </label>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Validation Results</h3>
              {validationResult.isValid ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {validationResult.data.length} records ready to import
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{validationResult.errors.length} validation errors found</span>
                  </div>
                  <div className="max-h-40 overflow-auto">
                    {validationResult.errors.map((error, index) => (
                      <div 
                        key={index}
                        className="text-sm text-gray-600 p-2 border-b"
                      >
                        Row {error.row}, Column '{error.column}': {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Importing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validationResult?.isValid || importing}
          >
            {importing ? 'Importing...' : 'Start Import'}
          </Button>
        </div>
      </Card>
    </div>
  );
}