import React, { useMemo, useRef, useState } from "react";
import ScannerPanel from "./components/ScannerPanel";
import ResultsTable from "./components/ResultTable";

export default function App() {
  const [expectedCount, setExpectedCount] = useState(4);
  const [countInput, setCountInput] = useState("4");
  const [scans, setScans] = useState([]);
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [popup, setPopup] = useState({ open: false, title: "", message: "", type: "ok" });
  const [locked, setLocked] = useState(false);

  const lastValueRef = useRef("");
  const cooldownRef = useRef(0);

  const openPopup = (title, message, type = "ok") => {
    setPopup({ open: true, title, message, type });
    setTimeout(() => {
      setPopup({ open: false, title: "", message: "", type: "ok" });
    }, 2500);
  };

  const resetSession = () => {
    setScans([]);
    setLocked(false);
    setSessionStatus("idle");
    lastValueRef.current = "";
    cooldownRef.current = 0;
  };

  const finalizeSession = (rows) => {
    const mismatchRow = rows.find((r) => !r.matched);

    if (mismatchRow) {
      setSessionStatus("not-ok");
      openPopup("NOT OK", `${mismatchRow.value} match nahi hua`, "not-ok");
    } else {
      setSessionStatus("ok");
      openPopup("OK", `Sabhi ${expectedCount} codes match ho gaye`, "ok");
    }

    setTimeout(() => resetSession(), 1800);
  };

  const addScan = (value, type = "Camera") => {
    const cleaned = value.trim();
    if (!cleaned || locked) return;

    const now = Date.now();
    const normalized = cleaned.toUpperCase();

    if (normalized === lastValueRef.current && now < cooldownRef.current) {
      return;
    }

    lastValueRef.current = normalized;
    cooldownRef.current = now + 1200;

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

      if (next.length >= expectedCount) {
        setLocked(true);
        setTimeout(() => finalizeSession(next), 300);
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
      {popup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className={`w-full max-w-sm border bg-white p-5 shadow-lg ${
              popup.type === "ok" ? "border-emerald-200" : "border-red-200"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                popup.type === "ok" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {popup.title}
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {popup.message}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Session auto reset ho jayega.
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-700 md:text-xs">
              Dixon Company
            </p>
            <h1 className="mt-1 text-xl font-bold md:text-3xl">
              Quantity Based Scanner
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Base code first scan se set hoga. {expectedCount} scans complete hote hi result aayega.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={countInput}
              onChange={(e) => setCountInput(e.target.value.replace(/[^0-9]/g, ""))}
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
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScannerPanel onScan={addScan} locked={locked} />
          </div>

          <div className="border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-base font-bold text-slate-900 md:text-lg">
              Session Info
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Expected quantity</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {expectedCount}
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Scanned</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Base code</p>
                <p className="mt-1 break-all font-semibold text-slate-900">
                  {scans[0]?.base || "Not scanned yet"}
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">Status</p>
                <p
                  className={`mt-1 font-semibold ${
                    sessionStatus === "ok"
                      ? "text-emerald-700"
                      : sessionStatus === "not-ok"
                      ? "text-red-700"
                      : "text-slate-900"
                  }`}
                >
                  {sessionStatus === "ok"
                    ? "OK"
                    : sessionStatus === "not-ok"
                    ? "NOT OK"
                    : "Waiting"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <ResultsTable rows={scans} expectedCount={expectedCount} />
        </div>
      </main>
    </div>
  );
}