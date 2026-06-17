import React, { useMemo, useState } from "react";
import ScannerPanel from "./components/ScannerPanel";
import SummaryCards from "./components/SummaryCards";
import ResultsTable from "./components/ResultTable";

export default function App() {
  const [scans, setScans] = useState([]);
  const [inputCode, setInputCode] = useState("");

  const addScan = (value, type = "Camera") => {
    const cleaned = value.trim();
    if (!cleaned) return;

    setScans((prev) => {
      const baseCode =
        prev.length > 0 ? prev[0].value.trim().toUpperCase() : cleaned.toUpperCase();

      const current = cleaned.toUpperCase();
      const matched = current === baseCode;

      return [
        {
          value: cleaned,
          type,
          time: new Date().toLocaleTimeString(),
          matched,
          base: baseCode,
        },
        ...prev,
      ];
    });
  };

  const addManual = () => {
    addScan(inputCode, "Manual");
    setInputCode("");
  };

  const clearAll = () => setScans([]);

  const stats = useMemo(() => {
    const total = scans.length;
    const matched = scans.filter((x) => x.matched).length;
    const mismatch = scans.filter((x) => !x.matched).length;
    return { total, matched, mismatch };
  }, [scans]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-700 md:text-xs">
              Dixon Company
            </p>
            <h1 className="mt-1 text-xl font-bold md:text-3xl">
              QR / Barcode Compare Dashboard
            </h1>
           
          </div>

          <div className="flex">
            <button
              onClick={clearAll}
              className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
        <div className="hidden md:block">
          <SummaryCards stats={stats} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScannerPanel onScan={addScan} />
          </div>

          <div className="border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-base font-bold text-slate-900 md:text-lg">
              Manual Add
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Scanner ke bina code add karne ke liye.
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-none border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
              />

              <button
                onClick={addManual}
                className="w-full rounded-none bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Add Code
              </button>
            </div>

            <div className="mt-4 border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Base code</p>
              <p className="mt-1 break-all font-semibold text-slate-900">
                {scans[0]?.value || "Not scanned yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-6">
          <ResultsTable rows={scans} />
        </div>
      </main>
    </div>
  );
}