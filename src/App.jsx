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
  const scannerBufferRef = useRef("");

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

  const playSuccessBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 1000;
      osc.type = "sine";

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.15
      );

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const playErrorBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 300;
      osc.type = "square";

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.4
      );

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const showBanner = (text, ms = 1700) => {
    setBanner(text);

    clearTimeout(bannerTimerRef.current);

    bannerTimerRef.current = setTimeout(() => {
      setBanner("");
    }, ms);
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
    scannerBufferRef.current = "";
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (locked) return;

      if (e.key === "Enter") {
        const code = scannerBufferRef.current.trim();

        if (code) {
          addScan(code, "Scanner");
        }

        scannerBufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        scannerBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [locked]);

  const finalize = (rows, stopScanner) => {
    if (finalizeLockRef.current) return;

    finalizeLockRef.current = true;
    setLocked(true);

    if (stopScanner) stopScanner();

    const mismatch = rows.find((r) => !r.matched);

    if (mismatch) {
      playErrorBeep();

      setSessionStatus("not-ok");
      showBanner(`❌ NOT OK : ${mismatch.value}`);
    } else {
      playSuccessBeep();

      setSessionStatus("ok");
      showBanner("✅ OK MATCHED");
    }

    resetTimerRef.current = setTimeout(() => {
      resetSession();
    }, 2500);
  };

  const addScan = (value, type = "Camera", stopScanner) => {
    const cleaned = value.trim();

    if (!cleaned || locked || finalizeLockRef.current) return;

    const now = Date.now();
    const normalized = cleaned.toUpperCase();

    if (
      normalized === lastValueRef.current &&
      now < cooldownRef.current
    ) {
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

      const nextRemaining = Math.max(
        expectedCount - next.length,
        0
      );

      setRemaining(nextRemaining);

      if (next.length === 1) {
        showBanner(`Base Captured`);
      } else if (next.length < expectedCount) {
        showBanner(`${next.length}/${expectedCount} Captured`);
      }

      if (next.length >= expectedCount) {
        clearTimeout(finalizeTimerRef.current);

        finalizeTimerRef.current = setTimeout(() => {
          finalize(next, stopScanner);
        }, 100);
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
        <div className="fixed left-0 right-0 top-0 z-50 px-2">
          <div className="mx-auto mt-2 max-w-7xl rounded border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold shadow md:text-sm">
            {banner}
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-700">
              Dixon Company
            </p>

            <h1 className="mt-1 text-base font-bold sm:text-xl md:text-3xl">
              Scanner Match Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={countInput}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");

                setCountInput(v);

                const n = parseInt(v || "0", 10);

                if (n > 0) {
                  setExpectedCount(n);
                  setRemaining(n);
                }
              }}
              className="w-16 border border-slate-300 px-3 py-2 text-sm"
            />

            <button
              onClick={resetSession}
              className="border border-slate-300 bg-white px-4 py-2 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-3 md:p-6">
        <div className="grid gap-4 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <ScannerPanel
              onScan={addScan}
              locked={locked}
            />
          </div>

          <aside className="border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="font-bold">Session Info</h2>

            <div className="mt-3 grid grid-cols-2 gap-2">

              <div className="border p-3">
                <p className="text-xs text-slate-500">Expected</p>
                <p className="text-lg font-bold">{expectedCount}</p>
              </div>

              <div className="border p-3">
                <p className="text-xs text-slate-500">Remaining</p>
                <p className="text-lg font-bold text-blue-700">
                  {remaining}
                </p>
              </div>

              <div className="border p-3">
                <p className="text-xs text-slate-500">OK</p>
                <p className="text-lg font-bold text-emerald-700">
                  {stats.matched}
                </p>
              </div>

              <div className="border p-3">
                <p className="text-xs text-slate-500">Not OK</p>
                <p className="text-lg font-bold text-red-700">
                  {stats.mismatch}
                </p>
              </div>
            </div>

            <div className="mt-3 border p-3">
              <p className="text-xs text-slate-500">Base Code</p>
              <p className="break-all text-sm font-semibold">
                {scans[0]?.base || "Not scanned yet"}
              </p>
            </div>

            <div className="mt-3 border p-3">
              <p className="text-xs text-slate-500">Status</p>

              <p
                className={`font-bold ${
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
                  : "WAITING"}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-4">
          <ResultsTable
            rows={scans}
            expectedCount={expectedCount}
          />
        </div>
      </main>
    </div>
  );
}