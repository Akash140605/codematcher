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

  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("scanHistory") || "[]");
  });

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

  const playBeep = (isError = false) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = isError ? "square" : "sine";
      oscillator.frequency.value = isError ? 250 : 1200;

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.4
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (err) {
      console.log(err);
    }
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

  const saveHistoryItem = (historyItem) => {
    setHistory((prev) => {
      const updatedHistory = [historyItem, ...prev].slice(0, 50);
      localStorage.setItem("scanHistory", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const finalize = (rows, stopScanner) => {
    if (finalizeLockRef.current) return;

    finalizeLockRef.current = true;
    setLocked(true);

    if (stopScanner) stopScanner();

    const mismatch = rows.find((r) => !r.matched);

    if (mismatch) {
      playBeep(true);
      setSessionStatus("not-ok");
      showBanner(`❌ NOT OK : ${mismatch.value}`);

      saveHistoryItem({
        id: Date.now(),
        status: "NOT OK",
        date: new Date().toLocaleString(),
        baseCode: rows[0]?.base || "",
        mismatchCode: mismatch.value,
        scanCount: rows.length,
        rows,
      });
    } else {
      playBeep(false);
      setSessionStatus("ok");
      showBanner("✅ OK MATCHED");

      saveHistoryItem({
        id: Date.now(),
        status: "OK",
        date: new Date().toLocaleString(),
        baseCode: rows[0]?.base || "",
        mismatchCode: null,
        scanCount: rows.length,
        rows,
      });
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
      const nextRemaining = Math.max(expectedCount - next.length, 0);

      setRemaining(nextRemaining);

      if (next.length === 1) {
        showBanner("Base Captured");
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
            <ScannerPanel onScan={addScan} locked={locked} />
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
                <p className="text-lg font-bold text-blue-700">{remaining}</p>
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
          <ResultsTable rows={scans} expectedCount={expectedCount} />
        </div>

        <div className="mt-5 border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Last 10 Sessions</h3>

            <button
              onClick={() => {
                localStorage.removeItem("scanHistory");
                setHistory([]);
              }}
              className="border px-3 py-1 text-xs"
            >
              Clear
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No History Available</p>
          ) : (
            history.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="mb-2 border p-3 text-sm"
              >
                <div
                  className={`font-bold ${
                    item.status === "OK"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {item.status}
                </div>

                <div>Base : {item.baseCode}</div>
                <div>Mismatch : {item.mismatchCode || "-"}</div>
                <div>Qty : {item.scanCount}</div>

                <div className="text-xs text-slate-500">
                  {item.date}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}