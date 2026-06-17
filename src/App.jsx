import React, { useEffect, useMemo, useRef, useState } from "react";
import ScannerPanel from "./components/ScannerPanel";
import ResultsTable from "./components/ResultTable";

export default function App() {
  const [expectedCount, setExpectedCount] = useState(4);
  const [countInput, setCountInput] = useState("4");
  const [remaining, setRemaining] = useState(4);
  const [scans, setScans] = useState([]);
  const [locked, setLocked] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [banner, setBanner] = useState("");

  const lastValueRef = useRef("");
  const cooldownRef = useRef(0);
  const finalizeTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const bannerTimerRef = useRef(null);
  const finalizeLockRef = useRef(false);

  useEffect(() => {
    setRemaining(expectedCount);
  }, [expectedCount]);

  useEffect(() => {
    return () => {
      clearTimeout(finalizeTimerRef.current);
      clearTimeout(resetTimerRef.current);
      clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const showBanner = (text, ms = 1700) => {
    setBanner(text);
    clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBanner(""), ms);
  };

  const resetSession = () => {
    clearTimeout(finalizeTimerRef.current);
    clearTimeout(resetTimerRef.current);
    clearTimeout(bannerTimerRef.current);

    setScans([]);
    setLocked(false);
    setSessionStatus("idle");
    setRemaining(expectedCount);
    setBanner("");
    finalizeLockRef.current = false;
    lastValueRef.current = "";
    cooldownRef.current = 0;
  };

  const finalize = (rows, stopScanner) => {
    if (finalizeLockRef.current) return;
    finalizeLockRef.current = true;
    setLocked(true);

    if (stopScanner) stopScanner();

    const mismatch = rows.find((r) => !r.matched);

    if (mismatch) {
      setSessionStatus("not-ok");
      showBanner(`NOT OK: ${mismatch.value} match nahi hua`);
    } else {
      setSessionStatus("ok");
      showBanner("OK MATCHED: sabhi codes match ho gaye");
    }

    resetTimerRef.current = setTimeout(() => {
      resetSession();
    }, 2200);
  };

  const addScan = (value, type = "Camera", stopScanner) => {
    const cleaned = value.trim();
    if (!cleaned || locked || finalizeLockRef.current) return;

    const now = Date.now();
    const normalized = cleaned.toUpperCase();

    if (normalized === lastValueRef.current && now < cooldownRef.current) return;

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
      const nextRemaining = Math.max(expectedCount - next.length, 0);
      setRemaining(nextRemaining);

      if (next.length === 1) {
        showBanner(`1 captured: ${cleaned}`);
      } else if (next.length < expectedCount) {
        showBanner(`${next.length} captured`);
      }

      if (next.length >= expectedCount) {
        clearTimeout(finalizeTimerRef.current);
        finalizeTimerRef.current = setTimeout(() => finalize(next, stopScanner), 100);
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
      {banner && (
        <div className="fixed left-0 right-0 top-0 z-50">
          <div className="mx-auto max-w-7xl px-3 pt-3">
            <div className="rounded-none border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm">
              {banner}
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-700 md:text-xs">
              Dixon Company
            </p>
            <h1 className="mt-1 text-lg font-bold md:text-3xl">Scanner Match Dashboard</h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              Quantity daalo, scan auto-add hota rahega, remaining live kam hoga.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={countInput}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setCountInput(v);
                const n = Number.parseInt(v || "0", 10);
                if (Number.isFinite(n) && n > 0) {
                  setExpectedCount(n);
                  setRemaining(n);
                }
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
                <p className="text-xs text-slate-500">Remaining</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">{remaining}</p>
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