import React from "react";

export default function ResultsTable({ rows, expectedCount }) {
  const pendingRows = Math.max(expectedCount - rows.length, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <h2 className="text-base font-bold text-slate-900 md:text-lg">
          Scanned Codes
        </h2>

        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          {expectedCount} scans complete hote hi result generate hoga.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left text-xs md:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Base</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No scans yet
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={`${row.value}-${row.time}-${idx}`}
                  className={`border-t border-slate-100 ${
                    row.matched ? "bg-white" : "bg-red-50/40"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-500">
                    {idx + 1}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <span className="break-all">{row.value}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    <span className="break-all">{row.base}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${
                        row.type === "Camera"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600">{row.time}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${
                        row.matched
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.matched ? "OK" : "NOT OK"}
                    </span>
                  </td>
                </tr>
              ))
            )}

            {rows.length > 0 &&
              Array.from({ length: pendingRows }).map((_, idx) => (
                <tr
                  key={`pending-${idx}`}
                  className="border-t border-slate-100 bg-slate-50/50"
                >
                  <td className="px-4 py-3 text-slate-400">
                    {rows.length + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-slate-400">Waiting...</td>
                  <td className="px-4 py-3 text-slate-400">-</td>
                  <td className="px-4 py-3 text-slate-400">-</td>
                  <td className="px-4 py-3 text-slate-400">-</td>
                  <td className="px-4 py-3 text-slate-400">PENDING</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}