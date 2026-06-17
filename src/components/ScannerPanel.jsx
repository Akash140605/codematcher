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
            className="rounded-none bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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

      <div className="p-4 md:p-5">
        <video ref={videoRef} className="h-64 w-full bg-black object-cover sm:h-72 md:h-96" />
        <div className="mt-3 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Camera open karo, code scan karo, aur entry automatically add ho jayegi.
        </div>
      </div>
    </div>
  );
}