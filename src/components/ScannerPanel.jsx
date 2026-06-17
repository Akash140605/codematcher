import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPanel({ onScan, locked }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const lastScanRef = useRef({ value: "", time: 0 });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => {
      readerRef.current?.reset();
    };
  }, []);

  useEffect(() => {
    if (locked) {
      readerRef.current?.reset();
      setRunning(false);
    }
  }, [locked]);

  const startScanner = async () => {
    if (!videoRef.current || locked) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    setRunning(true);

    try {
      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        const raw = result?.getText?.()?.trim();
        if (!raw) return;

        const now = Date.now();
        if (raw === lastScanRef.current.value && now - lastScanRef.current.time < 1500) {
          return;
        }

        lastScanRef.current = { value: raw, time: now };
        onScan(raw, "Camera");
      });
    } catch {
      setRunning(false);
    }
  };

  const stopScanner = () => {
    readerRef.current?.reset();
    setRunning(false);
  };

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 md:text-lg">Live Scanner</h2>
          <p className="text-xs text-slate-500 md:text-sm">
            Scan hote hi entry add ho jayegi.
          </p>
        </div>

        {!running ? (
          <button
            onClick={startScanner}
            disabled={locked}
            className="rounded-none bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="rounded-none bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Stop Camera
          </button>
        )}
      </div>

      <div className="grid gap-0 xl:grid-cols-2">
        <div className="border-b border-slate-200 xl:border-b-0 xl:border-r">
          <video ref={videoRef} className="h-64 w-full bg-black object-cover sm:h-72 md:h-96" />
        </div>

        <div className="p-4 md:p-5">
          <div className="border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Auto Scan Mode
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Base code first scan se set hoga. Same code ka repeat turant ignore hoga.
            </p>
          </div>

          <div className="mt-3 border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Mobile Friendly
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Small screen par bhi sab important parts visible rahenge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}