import { describe, it, expect } from "vitest";
import { BuyerCreateSchema } from "../lib/validators/buyer-validator";

describe("BuyerCreateSchema", () => {
  const baseValidData = {
    fullName: "John Doe",
    phone: "9876543210",
    city: "Chandigarh",
    propertyType: "Plot",
    purpose: "Buy",
    timeline: "0-3m",
    source: "Website",
  };

  it("should pass with valid data", () => {
    const result = BuyerCreateSchema.safeParse(baseValidData);
    expect(result.success).toBe(true);
  });

  it("should fail if fullName is too short", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      fullName: "J",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if phone number has non-digits", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      phone: "98765abcd",
    });
    expect(result.success).toBe(false);
  });

  it("should require bhk for Apartment", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      propertyType: "Apartment",
    });
    expect(result.success).toBe(false);
  });

  it("should allow bhk for Apartment", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      propertyType: "Apartment",
      bhk: "2",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if budgetMax < budgetMin", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      budgetMin: 100000,
      budgetMax: 50000,
    });
    expect(result.success).toBe(false);
  });

  it("should pass if budgetMax >= budgetMin", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      budgetMin: 50000,
      budgetMax: 100000,
    });
    expect(result.success).toBe(true);
  });

  it("should allow empty optional fields", () => {
    const result = BuyerCreateSchema.safeParse({
      ...baseValidData,
      email: "",
      notes: "",
      tags: [],
    });
    expect(result.success).toBe(true);
  });
});
