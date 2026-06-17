import React, { useEffect, useMemo, useRef, useState } from "react";
import ScannerPanel from "./components/ScannerPanel";
import ResultsTable from "./components/ResultTable";

export default function App() {
  const [expectedCount, setExpectedCount] = useState(4);
  const [countInput, setCountInput] = useState("4");
  const [scans, setScans] = useState([]);
  const [locked, setLocked] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [toast, setToast] = useState({ open: false, type: "info", title: "", message: "" });

  const lastValueRef = useRef("");
  const cooldownRef = useRef(0);
  const finalizingRef = useRef(false);

  const showToast = (type, title, message, duration = 1500) => {
    setToast({ open: true, type, title, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToast({ open: false, type: "info", title: "", message: "" });
    }, duration);
  };

  const resetSession = () => {
    setScans([]);
    setLocked(false);
    setSessionStatus("idle");
    finalizingRef.current = false;
    lastValueRef.current = "";
    cooldownRef.current = 0;
  };

  const finalize = (rows) => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    setLocked(true);

    const mismatch = rows.find((r) => !r.matched);

    if (mismatch) {
      setSessionStatus("not-ok");
      showToast("error", "NOT OK", `${mismatch.value} match nahi hua`, 2200);
    } else {
      setSessionStatus("ok");
      showToast("success", "OK MATCHED", `Sabhi ${expectedCount} codes match ho gaye`, 2200);
    }

    setTimeout(() => {
      resetSession();
    }, 2400);
  };

  const addScan = (value, type = "Camera") => {
    const cleaned = value.trim();
    if (!cleaned || locked) return;

    const now = Date.now();
    const normalized = cleaned.toUpperCase();

    if (normalized === lastValueRef.current && now < cooldownRef.current) return;

    lastValueRef.current = normalized;
    cooldownRef.current = now + 1300;

    setScans((prev) => {
      const baseCode = prev[0]?.base || normalized;

      const row = {
        value: cleaned,
        type,
        time: new Date().toLocaleTimeString(),
        base: baseCode,
        matched: normalized === baseCode,
      };

      const next = [row, ...prev];

      if (next.length === 1) {
        showToast("info", "1 CAPTURED", `Base code set: ${cleaned}`);
      } else if (next.length < expectedCount) {
        showToast("info", `${next.length} CAPTURED`, `${cleaned} added`);
      }

      if (next.length >= expectedCount) {
        setTimeout(() => finalize(next), 150);
      }

      return next;
    });
  };

  const stats = useMemo(() => {
    return {
      total: scans.length,
      matched: scans.filter((x) => x.matched).length,
      mismatch: scans.filter((x) => !x.matched).length,
    };
  }, [scans]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {toast.open && (
        <div className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-md">
          <div
            className={`border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : toast.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${
                toast.type === "success"
                  ? "text-emerald-700"
                  : toast.type === "error"
                  ? "text-red-700"
                  : "text-blue-700"
              }`}
            >
              {toast.title}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{toast.message}</p>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-700 md:text-xs">
              Dixon Company
            </p>
            <h1 className="mt-1 text-lg font-bold md:text-3xl">
              Scanner Match Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              Quantity daalo, scan auto add hoga, aur result automatically finalize hoga.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={countInput}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setCountInput(v);
                const n = Number.parseInt(v || "0", 10);
                if (Number.isFinite(n) && n > 0) setExpectedCount(n);
              }}
              inputMode="numeric"
              placeholder="Qty"
              className="w-20 rounded-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <button
              onClick={resetSession}
              className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScannerPanel onScan={addScan} locked={locked} />
          </div>

          <aside className="border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-base font-bold text-slate-900 md:text-lg">Session Info</h2>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-1">
              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Expected</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{expectedCount}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Scanned</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">OK</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.matched}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Not OK</p>
                <p className="mt-1 text-2xl font-bold text-red-700">{stats.mismatch}</p>
              </div>
            </div>

            <div className="mt-4 border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Base code</p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                {scans[0]?.base || "Not scanned yet"}
              </p>
            </div>

            <div className="mt-4 border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Status</p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  sessionStatus === "ok"
                    ? "text-emerald-700"
                    : sessionStatus === "not-ok"
                    ? "text-red-700"
                    : "text-slate-700"
                }`}
              >
                {sessionStatus === "ok"
                  ? "OK"
                  : sessionStatus === "not-ok"
                  ? "NOT OK"
                  : "Waiting"}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-5">
          <ResultsTable rows={scans} expectedCount={expectedCount} />
        </div>
      </main>
    </div>
  );
}