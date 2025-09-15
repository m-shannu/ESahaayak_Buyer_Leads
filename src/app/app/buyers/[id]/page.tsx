import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = {
  params: { id: string };
};

export default async function BuyerView({ params }: Props) {
  const id = params.id;
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) return <div>Not found</div>;

  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: "desc" },
    take: 5
  });

  return (
    <div>
      <h2>Lead: {buyer.fullName}</h2>

      <div>
        <strong>Phone:</strong> {buyer.phone}
      </div>
      <div>
        <strong>Email:</strong> {buyer.email ?? "-"}
      </div>
      <div>
        <strong>City:</strong> {buyer.city}
      </div>
      <div>
        <strong>Property:</strong> {buyer.propertyType} {buyer.bhk ? `(${buyer.bhk})` : ""}
      </div>
      <div>
        <strong>Budget:</strong> {buyer.budgetMin ?? "-"} - {buyer.budgetMax ?? "-"}
      </div>
      <div>
        <strong>Timeline:</strong> {buyer.timeline}
      </div>
      <div>
        <strong>Source:</strong> {buyer.source}
      </div>
      <div>
        <strong>Status:</strong> {buyer.status}
      </div>
      <div>
        <strong>Notes:</strong> {buyer.notes ?? "-"}
      </div>
      <div>
        <strong>Tags:</strong> {buyer.tags ? buyer.tags.split(",").map((t) => t.trim()).join(", ") : "-"}
      </div>
      <div>
        <strong>Updated:</strong> {new Date(buyer.updatedAt).toLocaleString()}
      </div>

      <div style={{ marginTop: 12 }}>
        <a href={`/buyers/${id}/edit`} className="button">Edit</a>
        <Link href="/buyers" style={{ marginLeft: 8 }}>Back</Link>
      </div>

      <h3>Recent changes</h3>
      <ul>
        {history.map((h) => (
          <li key={h.id}>
            <div>
              <strong>{h.changedBy}</strong> @{new Date(h.changedAt).toLocaleString()}
            </div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(h.diff, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
