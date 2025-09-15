"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface BuyerHistoryProps {
  buyerId: string;
}

interface History {
  id: string;
  action: string;
  date: string;
  notes: string;
}

const BuyerHistory: React.FC<BuyerHistoryProps> = ({ buyerId }) => {
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/buyers/${buyerId}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Error fetching buyer history:", err);
      }
    };
    fetchHistory();
  }, [buyerId]);

  return (
    <div className="p-6">
      <Card className="p-6 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          Buyer History
        </h2>
        {history.length > 0 ? (
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-blue-50 transition-colors border-b"
                >
                  <td className="px-4 py-2">{entry.action}</td>
                  <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 italic">No history available.</p>
        )}
      </Card>
    </div>
  );
};

export default BuyerHistory;
