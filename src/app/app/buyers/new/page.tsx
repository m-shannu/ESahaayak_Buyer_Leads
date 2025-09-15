"use client";
import React, { useState } from "react";
import { BuyerCreateSchema } from "@/lib/validators/buyer-validator";
import { z } from "zod";

export default function NewBuyerPage() {
  const [form, setForm] = useState<any>({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "1",
    purpose: "Buy",
    budgetMin: "",
    budgetMax: "",
    timeline: "Exploring",
    source: "Website",
    notes: "",
    tags: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<any>) => {
    setForm((s: any) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: any = { ...form, tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [] };

    // client-side zod
    const parsed = BuyerCreateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(JSON.stringify(parsed.error.format()));
      return;
    }

    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError((j && j.error) ? JSON.stringify(j.error) : `Error ${res.status}`);
      return;
    }

    setSuccess("Created");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "1",
      purpose: "Buy",
      budgetMin: "",
      budgetMax: "",
      timeline: "Exploring",
      source: "Website",
      notes: "",
      tags: ""
    });
  };

  return (
    <div>
      <h2>New Lead</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={onChange} />
        </label>

        <label>
          Email
          <input name="email" value={form.email} onChange={onChange} />
        </label>

        <label>
          Phone
          <input name="phone" value={form.phone} onChange={onChange} />
        </label>

        <label>
          City
          <select name="city" value={form.city} onChange={onChange}>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Property Type
          <select name="propertyType" value={form.propertyType} onChange={(e) => {
            onChange(e);
            // reset bhk when necessary
            if (e.target.value !== "Apartment" && e.target.value !== "Villa") {
              setForm((s: any) => ({ ...s, bhk: "" }));
            } else {
              setForm((s: any) => ({ ...s, bhk: "1" }));
            }
          }}>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </label>

        {(form.propertyType === "Apartment" || form.propertyType === "Villa") && (
          <label>
            BHK
            <select name="bhk" value={form.bhk} onChange={onChange}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>Studio</option>
            </select>
          </label>
        )}

        <label>
          Purpose
          <select name="purpose" value={form.purpose} onChange={onChange}>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </label>

        <label>
          Budget Min
          <input name="budgetMin" value={form.budgetMin} onChange={onChange} />
        </label>

        <label>
          Budget Max
          <input name="budgetMax" value={form.budgetMax} onChange={onChange} />
        </label>

        <label>
          Timeline
          <select name="timeline" value={form.timeline} onChange={onChange}>
            <option>0-3m</option>
            <option>3-6m</option>
            <option>&gt;6m</option>
            <option>Exploring</option>
          </select>
        </label>

        <label>
          Source
          <select name="source" value={form.source} onChange={onChange}>
            <option>Website</option>
            <option>Referral</option>
            <option>Walk-in</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Notes
          <textarea name="notes" value={form.notes} onChange={onChange} />
        </label>

        <label>
          Tags (comma separated)
          <input name="tags" value={form.tags} onChange={onChange} />
        </label>

        <div style={{ marginTop: 8 }}>
          <button type="submit">Create</button>
        </div>

        {error && <pre className="error">{error}</pre>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}
// "use client";
// import React from "react";
// import BuyerForm from "@/components/BuyerForm";
// import { BuyerCreateInput } from "@/lib/validators/buyer-validator";

// export default function NewBuyerPage() {
//   const handleCreate = async (data: BuyerCreateInput) => {
//     const res = await fetch("/api/buyers", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     if (res.ok) {
//       alert("Buyer created successfully");
//     } else {
//       const j = await res.json().catch(() => null);
//       alert(j?.error || "Error creating buyer");
//     }
//   };

//   return (
//     <div>
//       <h2>New Lead</h2>
//       <BuyerForm onSubmit={handleCreate} />
//     </div>
//   );
// }

