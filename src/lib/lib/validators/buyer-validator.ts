import { z } from "zod";

/* ---------------- ENUMS ---------------- */
export const propertyTypes = [
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
] as const;

export const cities = [
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
] as const;

export const bhkEnums = ["1", "2", "3", "4", "Studio"] as const;
export const purposes = ["Buy", "Rent"] as const;
export const timelines = ["0-3m", "3-6m", ">6m", "Exploring"] as const;
export const sources = ["Website", "Referral", "Walk-in", "Call", "Other"] as const;
export const statuses = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
] as const;

/* ---------------- COMMON HELPERS ---------------- */
// Transform tags: accepts string ("a,b") or array (["a","b"])
const tagsTransform = z
  .union([
    z.string(),
    z.array(z.string())
  ])
  .optional()
  .transform((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return val ?? [];
  });

/* ---------------- CREATE SCHEMA ---------------- */
export const BuyerCreateSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must not exceed 15 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    city: z.enum(cities),
    propertyType: z.enum(propertyTypes),
    purpose: z.enum(purposes),
    budgetMin: z.union([z.coerce.number().int().nonnegative(), z.undefined()]).optional(),
    budgetMax: z.union([z.coerce.number().int().nonnegative(), z.undefined()]).optional(),
    timeline: z.enum(timelines),
    source: z.enum(sources),
    notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
    tags: tagsTransform,
    bhk: z.enum(bhkEnums).optional(),
  })
  .superRefine((data, ctx) => {
    // BHK required for Apartment/Villa
    if (["Apartment", "Villa"].includes(data.propertyType) && !data.bhk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BHK is required for Apartment and Villa property types",
        path: ["bhk"],
      });
    }

    // budgetMax >= budgetMin
    if (
      typeof data.budgetMin === "number" &&
      typeof data.budgetMax === "number" &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum budget must be greater than or equal to minimum budget",
        path: ["budgetMax"],
      });
    }
  });

export type BuyerCreateInput = z.infer<typeof BuyerCreateSchema>;

/* ---------------- UPDATE SCHEMA ---------------- */
export const BuyerUpdateSchema = z
  .object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10).max(15).regex(/^\d+$/).optional(),
    city: z.enum(cities).optional(),
    propertyType: z.enum(propertyTypes).optional(),
    purpose: z.enum(purposes).optional(),
    budgetMin: z.union([z.coerce.number().int().nonnegative(), z.undefined()]).optional(),
    budgetMax: z.union([z.coerce.number().int().nonnegative(), z.undefined()]).optional(),
    timeline: z.enum(timelines).optional(),
    source: z.enum(sources).optional(),
    notes: z.string().max(1000).optional(),
    tags: tagsTransform,
    bhk: z.enum(bhkEnums).optional(),
    status: z.enum(statuses).optional(), // only for update
    updatedAt: z.date().default(() => new Date()), // auto-set if not provided
  })
  .superRefine((data, ctx) => {
    if (["Apartment", "Villa"].includes(data.propertyType ?? "") && !data.bhk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BHK is required for Apartment and Villa property types",
        path: ["bhk"],
      });
    }

    if (
      typeof data.budgetMin === "number" &&
      typeof data.budgetMax === "number" &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum budget must be greater than or equal to minimum budget",
        path: ["budgetMax"],
      });
    }
  });

export type BuyerUpdateInput = z.infer<typeof BuyerUpdateSchema>;
