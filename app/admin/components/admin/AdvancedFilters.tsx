// components/admin/AdvancedFilters.tsx
import React, { useState } from 'react';
import { 
  Filter, Search, X, Plus, 
  Calendar, ChevronDown, 
  SlidersHorizontal 
} from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'boolean';
  options?: { label: string; value: any }[];
  multiple?: boolean;
}

interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

interface AdvancedFiltersProps {
  config: FilterConfig[];
  onFilterChange: (filters: FilterValue[]) => void;
  onSearch: (query: string) => void;
}

export function AdvancedFilters({
  config,
  onFilterChange,
  onSearch
}: AdvancedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const operators = {
    text: [
      { label: 'Contains', value: 'contains' },
      { label: 'Equals', value: 'equals' },
      { label: 'Starts with', value: 'startsWith' },
      { label: 'Ends with', value: 'endsWith' }
    ],
    number: [
      { label: 'Equals', value: 'equals' },
      { label: 'Greater than', value: 'gt' },
      { label: 'Less than', value: 'lt' },
      { label: 'Between', value: 'between' }
    ],
    date: [
      { label: 'On', value: 'equals' },
      { label: 'After', value: 'gt' },
      { label: 'Before', value: 'lt' },
      { label: 'Between', value: 'between' }
    ],
    boolean: [
      { label: 'Is', value: 'equals' }
    ],
    select: [
      { label: 'Is', value: 'equals' },
      { label: 'Is not', value: 'not' },
      { label: 'In', value: 'in' }
    ]
  };

  const addFilter = (filter: FilterValue) => {
    setActiveFilters([...activeFilters, filter]);
    onFilterChange([...activeFilters, filter]);
    setShowFilterMenu(false);
  };

  const removeFilter = (index: number) => {
    const newFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const FilterMenu = () => (
    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border p-4 w-80 z-50">
      <div className="space-y-4">
        {config.map((field) => (
          <div key={field.field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            
            {field.type === 'select' && (
              <div className="space-y-2">
                <select 
                  className="w-full border rounded-md p-2"
                  onChange={(e) => addFilter({
                    field: field.field,
                    operator: 'equals',
                    value: e.target.value
                  })}
                >
                  <option value="">Select...</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {field.type === 'date' && (
              <DateRangePicker
                onChange={(dates) => addFilter({
                  field: field.field,
                  operator: 'between',
                  value: dates
                })}
              />
            )}

            {field.type === 'number' && (
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="Enter value"
                  onChange={(e) => addFilter({
                    field: field.field,
                    operator: 'equals',
                    value: parseInt(e.target.value)
                  })}
                />
              </div>
            )}

            {field.type === 'text' && (
              <div className="flex gap-2">
                <select className="border rounded-md p-2">
                  {operators.text.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="flex-1 border rounded-md p-2"
                  placeholder="Enter text"
                  onChange={(e) => addFilter({
                    field: field.field,
                    operator: 'contains',
                    value: e.target.value
                  })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Add Filter
          </Button>
          
          {showFilterMenu && <FilterMenu />}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => {
            const fieldConfig = config.find(c => c.field === filter.field);
            return (
              <Badge
                key={index}
                className="flex items-center gap-2 bg-blue-50 text-blue-700"
              >
                <span>{fieldConfig?.label}: {filter.value.toString()}</span>
                <button
                  onClick={() => removeFilter(index)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          
          <button
            onClick={() => {
              setActiveFilters([]);
              onFilterChange([]);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// Example usage configuration
const filterConfig: FilterConfig[] = [
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Suspended', value: 'SUSPENDED' }
    ]
  },
  {
    field: 'createdAt',
    label: 'Created Date',
    type: 'date'
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'number'
  },
  {
    field: 'category',
    label: 'Category',
    type: 'select',
    multiple: true,
    options: [
      { label: 'Bribery', value: 'BRIBERY' },
      { label: 'Fraud', value: 'FRAUD' },
      { label: 'Nepotism', value: 'NEPOTISM' }
    ]
  }
];