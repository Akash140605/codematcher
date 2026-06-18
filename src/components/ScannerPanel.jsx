import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPanel({ onScan, locked }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  const lastScanRef = useRef({
    value: "",
    time: 0,
  });

  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop?.();
      readerRef.current?.reset?.();
    };
  }, []);

  useEffect(() => {
    if (locked) {
      controlsRef.current?.stop?.();
      readerRef.current?.reset?.();
      setRunning(false);
    }
  }, [locked]);

  const stopScanner = () => {
    controlsRef.current?.stop?.();
    readerRef.current?.reset?.();
    setRunning(false);
  };

  const startScanner = async () => {
    if (!videoRef.current || locked) return;

    try {
      const reader = new BrowserMultiFormatReader();

      readerRef.current = reader;
      setRunning(true);

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          const raw = result?.getText?.()?.trim();

          if (!raw) return;

          const now = Date.now();

          if (
            raw === lastScanRef.current.value &&
            now - lastScanRef.current.time < 1200
          ) {
            return;
          }

          lastScanRef.current = {
            value: raw,
            time: now,
          };

          onScan(raw, "Camera", stopScanner);
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error(error);
      setRunning(false);
    }
  };

  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-base font-bold text-slate-900 md:text-lg">
            Live Scanner
          </h2>

          <p className="text-xs text-slate-500">
            Camera ya USB scanner dono support hain.
          </p>
        </div>

        {!running ? (
          <button
            onClick={startScanner}
            disabled={locked}
            className="bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Stop Camera
          </button>
        )}
      </div>

      <div className="p-3 md:p-5">
        <video
          ref={videoRef}
          className="h-[220px] w-full rounded bg-black object-cover sm:h-[320px] md:h-[500px]"
          playsInline
          muted
        />

        <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 md:text-sm">
          📷 Camera Scan Supported
          <br />
          🔫 USB Barcode Scanner Supported
          <br />
          🔄 Duplicate scans automatically ignored
        </div>
      </div>
    </div>
  );
}