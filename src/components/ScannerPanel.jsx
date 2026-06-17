import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPanel({ onScan, locked }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [running, setRunning] = useState(false);
  const lastScanRef = useRef({ value: "", time: 0 });

  useEffect(() => {
    return () => {
      readerRef.current?.reset();
    };
  }, []);

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
        if (
          raw === lastScanRef.current.value &&
          now - lastScanRef.current.time < 1500
        ) {
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

  useEffect(() => {
    if (locked) stopScanner();
  }, [locked]);

  return (
    <div className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Scanner</h2>
          <p className="text-sm text-slate-500">
            Scan hote hi entry automatic add hogi.
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

      <div className="grid gap-0 xl:grid-cols-2">
        <div className="border-b border-slate-200 xl:border-b-0 xl:border-r">
          <video ref={videoRef} className="h-72 w-full bg-black object-cover md:h-96" />
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Auto scan mode
          </h3>

          <div className="mt-4 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Same code baar-baar turant register nahi hoga. Dusre QR/barcode par move karke next scan hoga.
          </div>

          <div className="mt-4 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Manual entry ab optional hai. Camera scan se direct entry add hoti hai.
          </div>
        </div>
      </div>
    </div>
  );
}