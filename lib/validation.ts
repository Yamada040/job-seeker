import { z } from "zod";

const trimString = (value: unknown) => {
  if (typeof value !== "string") return value;
  return value.trim();
};

export const requiredTrimmedString = z.preprocess(trimString, z.string().min(1));

export const optionalTrimmedString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().optional());

export const optionalString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;
  return value;
}, z.string().optional());

export const optionalNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().finite().optional());

export const optionalNonNegativeNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().finite().nonnegative().optional());

export const checkboxBoolean = z.preprocess((value) => value === "on", z.boolean());
