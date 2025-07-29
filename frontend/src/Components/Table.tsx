import React from 'react';

type Column<T> = {
  key: keyof T;
  label: string;
};

type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => React.ReactNode;
};

export default function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  actions,
}: GenericTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-6 py-3 whitespace-nowrap">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-gray-800">
                  {String(row[column.key])}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
