import React from "react";

export default function ResultsTable({ rows, expectedCount }) {
  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 md:px-5">
        <h2 className="text-base font-bold text-slate-900 md:text-lg">Scanned Codes</h2>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          {expectedCount} scans complete hote hi final message aayega.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-4 font-semibold uppercase tracking-wide md:px-5">Code</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-wide md:px-5">Type</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-wide md:px-5">Time</th>
              <th className="px-4 py-4 font-semibold uppercase tracking-wide md:px-5">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-slate-500" colSpan="4">
                  No scans yet
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${row.value}-${idx}`} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-medium text-slate-900 md:px-5">{row.value}</td>
                  <td className="px-4 py-4 text-slate-600 md:px-5">{row.type}</td>
                  <td className="px-4 py-4 text-slate-600 md:px-5">{row.time}</td>
                  <td className="px-4 py-4 md:px-5">
                    <span
                      className={`inline-flex items-center border px-3 py-1 text-xs font-semibold ${
                        row.matched
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {row.matched ? "OK" : "Not OK"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}