import React from "react";
import { FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";

export default function ResultsTable({ rows }) {
  const total = rows.length;
  const matched = rows.filter((row) => row.matched).length;
  const mismatch = rows.filter((row) => !row.matched).length;

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Scanned Codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live scan results with match status.
          </p>
        </div>

        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2">
            <FiFileText className="text-slate-500" />
            <span className="font-medium text-slate-700">Total: {total}</span>
          </div>
          <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2">
            <FiCheckCircle className="text-emerald-600" />
            <span className="font-medium text-emerald-700">OK: {matched}</span>
          </div>
          <div className="flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2">
            <FiXCircle className="text-red-600" />
            <span className="font-medium text-red-700">Mismatch: {mismatch}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold uppercase tracking-wide">
                Code
              </th>
              <th scope="col" className="px-5 py-4 font-semibold uppercase tracking-wide">
                Type
              </th>
              <th scope="col" className="px-5 py-4 font-semibold uppercase tracking-wide">
                Time
              </th>
              <th scope="col" className="px-5 py-4 font-semibold uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-slate-500" colSpan="4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
                      <FiFileText className="text-xl" />
                    </div>
                    <p className="font-medium text-slate-700">No scans yet</p>
                    <p className="text-sm text-slate-500">
                      Scanner start karo ya manually code add karo.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={`${row.value}-${idx}`}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">{row.value}</td>
                  <td className="px-5 py-4 text-slate-600">{row.type}</td>
                  <td className="px-5 py-4 text-slate-600">{row.time}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold ${
                        row.matched
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {row.matched ? <FiCheckCircle /> : <FiXCircle />}
                      {row.matched ? "OK" : "Mismatch"}
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