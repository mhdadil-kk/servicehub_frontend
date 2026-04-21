import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const Table = <T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 card-premium">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent shadow-sm"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 card-premium text-slate-400 gap-3">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         </div>
         <p className="text-sm font-bold uppercase tracking-wider">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto card-premium shadow-md border-slate-200/50">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F8FAFC] border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-blue-50/30 transition-all duration-200 group"
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-8 py-5 text-[13px] font-semibold text-slate-700">
                  {typeof col.accessor === "function"
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
