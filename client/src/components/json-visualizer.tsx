import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JsonVisualizerProps {
  data: any;
  title?: string;
}

export default function JsonVisualizer({ data, title = 'JSON Visualization' }: JsonVisualizerProps) {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  // Reset expanded nodes when data changes
  useEffect(() => {
    setExpandedNodes([]);
  }, [data]);

  if (!data) {
    return <div className="text-center p-4 text-gray-500">No data to visualize</div>;
  }

  const toggleNode = (path: string) => {
    if (expandedNodes.includes(path)) {
      setExpandedNodes(expandedNodes.filter(nodePath => nodePath !== path));
    } else {
      setExpandedNodes([...expandedNodes, path]);
    }
  };

  // Function to determine if a value is an expandable object
  const isExpandable = (value: any): boolean => {
    return value !== null && 
           typeof value === 'object' && 
           !Array.isArray(value) && 
           Object.keys(value).length > 0;
  };

  // Function to determine if a value is an array of objects
  const isObjectArray = (value: any): boolean => {
    return Array.isArray(value) && 
           value.length > 0 && 
           typeof value[0] === 'object' && 
           value[0] !== null;
  };

  // Function to format primitive values
  const formatValue = (value: any): JSX.Element => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (value === undefined) return <span className="text-gray-400">undefined</span>;
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "outline"} className={value ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
        {value.toString()}
      </Badge>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-orange-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline flex items-center"
          >
            {value.length > 30 ? `${value.substring(0, 30)}...` : value}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        );
      }
      return <span className="text-green-600">"{value}"</span>;
    }
    
    return <span>{String(value)}</span>;
  };

  // Render a simple object as a table
  const renderObjectTable = (obj: Record<string, any>, path: string = '') => {
    return (
      <Table className="border rounded-md">
        <TableBody>
          {Object.entries(obj).map(([key, value], index) => {
            const currentPath = path ? `${path}.${key}` : key;
            const isExpanded = expandedNodes.includes(currentPath);
            
            if (isExpandable(value)) {
              return (
                <React.Fragment key={index}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell 
                      className="font-medium cursor-pointer" 
                      onClick={() => toggleNode(currentPath)}
                    >
                      <div className="flex items-center">
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                        }
                        {key}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {`{${Object.keys(value).length} properties}`}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={2} className="p-0">
                        <div className="ml-6 py-2">
                          {renderObjectTable(value, currentPath)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            } else if (isObjectArray(value)) {
              return (
                <React.Fragment key={index}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell 
                      className="font-medium cursor-pointer" 
                      onClick={() => toggleNode(currentPath)}
                    >
                      <div className="flex items-center">
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                        }
                        {key}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {`[${value.length} items]`}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={2} className="p-0">
                        <div className="ml-6 py-2">
                          {renderArrayTable(value, currentPath)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            } else if (Array.isArray(value)) {
              return (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-gray-600">[{value.map((v, i) => (
                      <span key={i}>{formatValue(v)}{i < value.length - 1 ? ', ' : ''}</span>
                    ))}]</span>
                  </TableCell>
                </TableRow>
              );
            } else {
              return (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell className="text-right">{formatValue(value)}</TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    );
  };

  // Render an array of objects as a table
  const renderArrayTable = (array: any[], path: string = '') => {
    if (array.length === 0) {
      return <div className="text-sm text-gray-500 p-2">Empty array</div>;
    }

    // Get all unique keys from all objects in the array
    const allKeys = Array.from(
      new Set(
        array.flatMap(item => 
          typeof item === 'object' && item !== null 
            ? Object.keys(item) 
            : []
        )
      )
    );

    // If this is an array of primitive values or mixed types
    if (allKeys.length === 0) {
      return (
        <div className="space-y-1 py-2">
          {array.map((item, index) => (
            <div key={index} className="p-1 hover:bg-gray-50 rounded">
              {formatValue(item)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <Table className="border rounded-md">
        <TableHeader>
          <TableRow>
            {allKeys.map(key => (
              <TableHead key={key}>{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {array.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {allKeys.map((key, cellIndex) => {
                const value = item[key];
                const currentPath = `${path}[${rowIndex}].${key}`;
                const isExpanded = expandedNodes.includes(currentPath);

                if (isExpandable(value)) {
                  return (
                    <TableCell key={cellIndex}>
                      <div 
                        className="cursor-pointer flex items-center" 
                        onClick={() => toggleNode(currentPath)}
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-1 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                        }
                        <span className="text-gray-500">{`{${Object.keys(value).length}}`}</span>
                      </div>
                      {isExpanded && (
                        <div className="mt-1 ml-4">
                          {renderObjectTable(value, currentPath)}
                        </div>
                      )}
                    </TableCell>
                  );
                }
                
                if (isObjectArray(value)) {
                  return (
                    <TableCell key={cellIndex}>
                      <div 
                        className="cursor-pointer flex items-center" 
                        onClick={() => toggleNode(currentPath)}
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4 mr-1 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                        }
                        <span className="text-gray-500">{`[${value.length}]`}</span>
                      </div>
                      {isExpanded && (
                        <div className="mt-1 ml-4">
                          {renderArrayTable(value, currentPath)}
                        </div>
                      )}
                    </TableCell>
                  );
                }
                
                return (
                  <TableCell key={cellIndex}>
                    {formatValue(value)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Main render
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isExpandable(data) ? (
          renderObjectTable(data)
        ) : isObjectArray(data) ? (
          renderArrayTable(data)
        ) : (
          <div className="p-4 border rounded-md">
            {formatValue(data)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}