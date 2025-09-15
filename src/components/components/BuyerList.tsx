"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

const BuyerList: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const res = await fetch("/api/buyers");
        if (res.ok) {
          const data = await res.json();
          setBuyers(data);
        }
      } catch (err) {
        console.error("Error fetching buyers:", err);
      }
    };
    fetchBuyers();
  }, []);

  return (
    <div className="p-6">
      <Card className="p-6 shadow-xl bg-gradient-to-r from-green-50 to-green-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          Buyer List
        </h2>
        {buyers.length > 0 ? (
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => (
                <tr
                  key={buyer.id}
                  className="hover:bg-green-50 transition-colors border-b"
                >
                  <td className="px-4 py-2">{buyer.name}</td>
                  <td className="px-4 py-2">{buyer.email}</td>
                  <td className="px-4 py-2">{buyer.phone}</td>
                  <td className="px-4 py-2">{buyer.location}</td>
                  <td className="px-4 py-2 text-center">
                    <Link href={`/buyers/${buyer.id}`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        View
                      </Button>
                    </Link>
                    <Link href={`/buyers/${buyer.id}/history`}>
                      <Button variant="default" size="sm">
                        History
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 italic">No buyers found.</p>
        )}
      </Card>
    </div>
  );
};

export default BuyerList;
