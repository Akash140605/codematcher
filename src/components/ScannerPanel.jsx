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
  const [error, setError] = useState("");

  const cleanupScanner = () => {
    try {
      controlsRef.current?.stop?.();
    } catch (err) {
      console.error("Stop control error:", err);
    }

    try {
      readerRef.current?.reset?.();
    } catch (err) {
      console.error("Reader reset error:", err);
    }

    controlsRef.current = null;
    readerRef.current = null;
    setRunning(false);
  };

  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);

  useEffect(() => {
    if (locked) {
      cleanupScanner();
    }
  }, [locked]);

  const stopScanner = () => {
    cleanupScanner();
  };

  const startScanner = async () => {
    if (!videoRef.current || locked || running) return;

    setError("");

    try {
      cleanupScanner();

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      setRunning(true);

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (err) {
            return;
          }

          const raw = result?.getText?.()?.trim();
          if (!raw) return;

          const now = Date.now();
          const normalized = raw.toUpperCase();

          if (
            normalized === lastScanRef.current.value &&
            now - lastScanRef.current.time < 1200
          ) {
            return;
          }

          lastScanRef.current = {
            value: normalized,
            time: now,
          };

          onScan(raw, "Camera", stopScanner);
        }
      );

      controlsRef.current = controls;
    } catch (err) {
      console.error("Scanner start error:", err);
      setError("Camera start nahi ho paayi. Permission aur device check karo.");
      cleanupScanner();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 md:text-lg">
            Live Scanner
          </h2>
          <p className="text-xs text-slate-500 md:text-sm">
            Camera aur USB scanner dono supported hain.
          </p>
        </div>

        {!running ? (
          <button
            onClick={startScanner}
            disabled={locked}
            className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Stop Camera
          </button>
        )}
      </div>

      <div className="p-3 md:p-5">
        <div className="overflow-hidden rounded border border-slate-200 bg-black">
          <video
            ref={videoRef}
            className="h-[220px] w-full bg-black object-cover sm:h-[320px] md:h-[500px]"
            playsInline
            muted
            autoPlay
          />
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 md:text-sm">
          <div>📷 Camera scan supported</div>
          <div>🔫 USB barcode scanner supported</div>
          <div>🔄 Duplicate scans automatically ignored</div>
          <div>
            {locked
              ? "🔒 Session locked hai"
              : running
              ? "🟢 Camera running"
              : "⚪ Camera stopped"}
          </div>
        </div>
      </div>
    </div>
  );
}