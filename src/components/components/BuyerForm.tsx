"use client";
import React, { useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BuyerUpdateSchema } from "@/lib/validators/buyer-validator";
import { cities, propertyTypes, bhkEnums, purposes, timelines, sources, statuses } from "@/lib/validators/buyer-validator";

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
    watch,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(BuyerUpdateSchema) as Resolver<BuyerFormData>,
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
      tags: undefined, 
      status: "New",
      updatedAt: undefined,
    },
  });

  const formPropertyType = watch("propertyType");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        budgetMin: initialData.budgetMin?.toString() ?? "",
        budgetMax: initialData.budgetMax?.toString() ?? "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : (initialData.tags ?? ""),
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: BuyerFormData) => {
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
        {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input id="phone" {...register("phone")} />
        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <select id="city" {...register("city")}>
          <option value="">Select city</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
        {errors.city && <p className="error-message">{errors.city.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="propertyType">Property Type</label>
        <select id="propertyType" {...register("propertyType")}>
          <option value="">Select type</option>
          {propertyTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        {errors.propertyType && <p className="error-message">{errors.propertyType.message}</p>}
      </div>

      {['Apartment', 'Villa'].includes(formPropertyType || '') && (
        <div className="form-group">
          <label htmlFor="bhk">BHK</label>
          <select id="bhk" {...register("bhk")}>
            <option value="">Select BHK</option>
            {bhkEnums.map((bhkValue) => (
              <option key={bhkValue}>{bhkValue}</option>
            ))}
          </select>
          {errors.bhk && <p className="error-message">{errors.bhk.message}</p>}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="budgetMin">Budget Min</label>
          <input id="budgetMin" type="number" {...register("budgetMin", { valueAsNumber: true })} />
          {errors.budgetMin && <p className="error-message">{errors.budgetMin.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="budgetMax">Budget Max</label>
          <input id="budgetMax" type="number" {...register("budgetMax", { valueAsNumber: true })} />
          {errors.budgetMax && <p className="error-message">{errors.budgetMax.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="timeline">Timeline</label>
        <select id="timeline" {...register("timeline")}>
          <option value="">Select timeline</option>
          {timelines.map((timeline) => (
            <option key={timeline}>{timeline}</option>
          ))}
        </select>
        {errors.timeline && <p className="error-message">{errors.timeline.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="source">Source</label>
        <select id="source" {...register("source")}>
          <option value="">Select source</option>
          {sources.map((source) => (
            <option key={source}>{source}</option>
          ))}
        </select>
        {errors.source && <p className="error-message">{errors.source.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" {...register("notes")} />
        {errors.notes && <p className="error-message">{errors.notes.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" {...register("tags")} />
        {errors.tags && <p className="error-message">{errors.tags.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" {...register("status")}>
          <option value="">Select status</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        {errors.status && <p className="error-message">{errors.status.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="button">
        {loading ? "⏳ Saving..." : "💾 Save Lead"}
      </button>
    </form>
  );
}
