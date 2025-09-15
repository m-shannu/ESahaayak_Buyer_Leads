
"use client";
import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BuyerUpdateSchema } from "@/lib/validators/buyer-validator";

type BuyerFormData = z.infer<typeof BuyerUpdateSchema>;

type BuyerFormProps = {
  initialData?: any;
  onSubmit: (data: BuyerFormData) => Promise<void>;
};

export default function BuyerForm({ initialData, onSubmit }: BuyerFormProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(BuyerUpdateSchema) as unknown as Resolver<BuyerFormData>,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: undefined,
      propertyType: undefined,
      bhk: undefined,
      purpose: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      timeline: undefined,
      source: undefined,
      notes: "",
      tags: [],
      status: "New",
      updatedAt: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        budgetMin: initialData.budgetMin?.toString() ?? "",
        budgetMax: initialData.budgetMax?.toString() ?? "",
        tags: Array.isArray(initialData.tags) ? initialData.tags : (initialData.tags?.split(",").map((t: string) => t.trim()).filter(Boolean) ?? []),
      });
    }
  }, [initialData, reset]);

  const onFormSubmit: SubmitHandler<BuyerFormData> = async (data) => {
    setLoading(true);
    setServerError(null);
    setSuccess(null);

    try {
      await onSubmit(data);
      setSuccess("✅ Saved successfully!");
      if (!initialData) {
        reset();
      }
    } catch (err: any) {
      setServerError(err.message || "❌ Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="buyer-form" onSubmit={handleSubmit(onFormSubmit)}>
      <h2>{initialData ? "✏️ Edit Lead" : "➕ New Lead"}</h2>
      {success && <div className="success">{success}</div>}
      {serverError && <pre className="error">{serverError}</pre>}

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input id="fullName" {...register("fullName")} />
        {typeof errors.fullName?.message === "string" && <p className="error-message">{errors.fullName.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input id="phone" {...register("phone")} />
        {typeof errors.phone?.message === "string" && <p className="error-message">{errors.phone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {typeof errors.email?.message === "string" && <p className="error-message">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <select id="city" {...register("city")}>
          <option value="">Select city</option>
          <option>Chandigarh</option><option>Mohali</option><option>Zirakpur</option><option>Panchkula</option><option>Other</option>
        </select>
        {typeof errors.city?.message === "string" && <p className="error-message">{errors.city.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="propertyType">Property Type</label>
        <select id="propertyType" {...register("propertyType")}>
          <option value="">Select type</option>
          <option>Apartment</option><option>Villa</option><option>Plot</option><option>Office</option><option>Retail</option>
        </select>
        {typeof errors.propertyType?.message === "string" && <p className="error-message">{errors.propertyType.message}</p>}
      </div>

      {['Apartment', 'Villa'].includes(initialData?.propertyType || '') && (
        <div className="form-group">
          <label htmlFor="bhk">BHK</label>
          <select id="bhk" {...register("bhk")}>
            <option value="">Select BHK</option>
            <option>1</option><option>2</option><option>3</option><option>4</option><option>Studio</option>
          </select>
          {typeof errors.bhk?.message === "string" && <p className="error-message">{errors.bhk.message}</p>}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="budgetMin">Budget Min</label>
          <input id="budgetMin" type="number" {...register("budgetMin", { valueAsNumber: true })} />
          {typeof errors.budgetMin?.message === "string" && <p className="error-message">{errors.budgetMin.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="budgetMax">Budget Max</label>
          <input id="budgetMax" type="number" {...register("budgetMax", { valueAsNumber: true })} />
          {typeof errors.budgetMax?.message === "string" && <p className="error-message">{errors.budgetMax.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="timeline">Timeline</label>
        <select id="timeline" {...register("timeline")}>
          <option value="">Select timeline</option>
          <option>0-3m</option><option>3-6m</option><option>&gt;6m</option><option>Exploring</option>
        </select>
        {typeof errors.timeline?.message === "string" && <p className="error-message">{errors.timeline.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="source">Source</label>
        <select id="source" {...register("source")}>
          <option value="">Select source</option>
          <option>Website</option><option>Referral</option><option>Walk-in</option><option>Call</option><option>Other</option>
        </select>
        {typeof errors.source?.message === "string" && <p className="error-message">{errors.source.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" {...register("notes")} />
        {typeof errors.notes?.message === "string" && <p className="error-message">{errors.notes.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" {...register("tags")} />
        {typeof errors.tags?.message === "string" && <p className="error-message">{errors.tags.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" {...register("status")}>
          <option>New</option><option>Qualified</option><option>Contacted</option><option>Visited</option><option>Negotiation</option><option>Converted</option><option>Dropped</option>
        </select>
        {typeof errors.status?.message === "string" && <p className="error-message">{errors.status.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="button">
        {loading ? "⏳ Saving..." : "💾 Save Lead"}
      </button>
    </form>
  );
}