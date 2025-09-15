"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  purpose: string;
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuyers() {
      try {
        const res = await fetch("/api/buyers", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch buyers");
        const json = await res.json();
        setBuyers(json.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Could not load buyers. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBuyers();
  }, []);

  if (loading) return <p className="p-4">Loading buyers...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <Link
          href="/buyers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Buyer
        </Link>
      </div>

      {buyers.length === 0 ? (
        <p>No buyers found.</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="p-2 border">Name</th>
              <th scope="col" className="p-2 border">Phone</th>
              <th scope="col" className="p-2 border">City</th>
              <th scope="col" className="p-2 border">Property Type</th>
              <th scope="col" className="p-2 border">Purpose</th>
              <th scope="col" className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="p-2 border">{buyer.fullName}</td>
                <td className="p-2 border">{buyer.phone}</td>
                <td className="p-2 border">{buyer.city}</td>
                <td className="p-2 border">{buyer.propertyType}</td>
                <td className="p-2 border">{buyer.purpose}</td>
                <td className="p-2 border text-center">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
