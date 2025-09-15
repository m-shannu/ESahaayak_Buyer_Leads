import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const PAGE_SIZE = 10;

export default async function BuyersPage({ searchParams }: Props) {
  const params = searchParams ?? {};
  const page = Number(params?.page ?? 1);
  const q = (params?.q ?? "") as string;
  const city = (params?.city ?? undefined) as string | undefined;
  const propertyType = (params?.propertyType ?? undefined) as string | undefined;
  const status = (params?.status ?? undefined) as string | undefined;
  const timeline = (params?.timeline ?? undefined) as string | undefined;

  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, buyers] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (Math.max(1, page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="buyers-container">
      <h2 className="title">📋 Buyer Leads</h2>

      {/* Filters */}
      <form method="get" className="filters">
        <input
          name="q"
          placeholder="🔍 Search name / phone / email"
          defaultValue={q}
        />
        <select name="city" defaultValue={city || ""}>
          <option value="">All cities</option>
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>
        <select name="propertyType" defaultValue={propertyType || ""}>
          <option value="">All types</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>
        <select name="status" defaultValue={status || ""}>
          <option value="">All statuses</option>
          <option>New</option>
          <option>Qualified</option>
          <option>Contacted</option>
          <option>Visited</option>
          <option>Negotiation</option>
          <option>Converted</option>
          <option>Dropped</option>
        </select>
        <button type="submit">Apply</button>
      </form>

      {/* Table */}
      {buyers.length === 0 ? (
        <div className="empty">❌ No leads found</div>
      ) : (
        <table className="buyers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Property</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((b) => (
              <tr key={b.id}>
                <td>{b.fullName}</td>
                <td>{b.phone}</td>
                <td>{b.city}</td>
                <td>{b.propertyType}</td>
                <td>
                  {b.budgetMin ? `${b.budgetMin}` : "-"} - {b.budgetMax ?? "-"}
                </td>
                <td>{b.timeline}</td>
                <td>
                  <span className={`status ${b.status?.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td>{new Date(b.updatedAt).toLocaleString()}</td>
                <td>
                  <Link href={`/buyers/${b.id}`} className="view-btn">
                    View / Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        <span>
          Page {page} / {pages}
        </span>
        <div>
          {page > 1 && (
            <Link
              href={`?${new URLSearchParams({
                ...(searchParams as any),
                page: String(page - 1),
              }).toString()}`}
              className="page-btn"
            >
              ⬅ Prev
            </Link>
          )}
          {page < pages && (
            <Link
              href={`?${new URLSearchParams({
                ...(searchParams as any),
                page: String(page + 1),
              }).toString()}`}
              className="page-btn"
            >
              Next ➡
            </Link>
          )}
        </div>
      </div>

      <div className="new-lead">
        <a href="/buyers/new" className="button">
          ➕ New Lead
        </a>
      </div>
    </div>
  );
}
