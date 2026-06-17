import React from "react";
import { FiCheckCircle, FiXCircle, FiLayers } from "react-icons/fi";

export default function SummaryCards({ stats }) {
  const cards = [
    { label: "Total Scans", value: stats.total, icon: <FiLayers />, tone: "text-blue-700" },
    { label: "Matched", value: stats.matched, icon: <FiCheckCircle />, tone: "text-emerald-700" },
    { label: "Mismatch", value: stats.mismatch, icon: <FiXCircle />, tone: "text-red-700" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className={`text-2xl ${card.tone}`}>{card.icon}</div>
          <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}