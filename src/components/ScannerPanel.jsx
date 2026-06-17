import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPanel({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    return () => {
      if (readerRef.current) readerRef.current.reset();
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    setRunning(true);

    try {
      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result?.getText()) {
          onScan(result.getText(), "Camera");
        }
      });
    } catch {
      setRunning(false);
    }
  };

  const stopScanner = () => {
    if (readerRef.current) readerRef.current.reset();
    setRunning(false);
  };

  const addManual = () => {
    if (!manualCode.trim()) return;
    onScan(manualCode.trim(), "Manual");
    setManualCode("");
  };

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Scanner</h2>
          <p className="text-sm text-slate-500">
            Camera se scan karo ya manually code enter karo.
          </p>
        </div>

        {!running ? (
          <button
            onClick={startScanner}
            className="rounded-none bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="rounded-none bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Stop Camera
          </button>
        )}
      </div>

      <div className="grid gap-0 xl:grid-cols-2">
        <div className="border-b border-slate-200 xl:border-b-0 xl:border-r">
          <video ref={videoRef} className="h-72 w-full bg-black object-cover md:h-96" />
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manual Entry
          </h3>

          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter scanned code"
            className="mt-3 w-full rounded-none border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <button
            onClick={addManual}
            className="mt-3 w-full rounded-none bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Scan
          </button>

          <div className="mt-4 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            First scanned code automatically becomes the base. Baaki sab uske against compare honge.
          </div>
        </div>
      </div>
    </div>
  );
}