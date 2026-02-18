import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// Helper: Sanitize string
function sanitize(str: string): string {
  return DOMPurify.sanitize(str.trim());
}

// Helper: Sanitize and validate string
const sanitizedString = (min: number = 1, max: number = 255) =>
  z.string().min(min).max(max).transform((s) => sanitize(s));

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı.")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli.")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli."),
  name: z.string().min(1).max(100).transform(sanitize).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre gerekli."),
});

// Project validation schemas
export const projectCreateSchema = z.object({
  name: sanitizedString(1, 255),
  description: sanitizedString(0, 2000).optional().or(z.literal("")),
  location: sanitizedString(0, 500).optional().or(z.literal("")),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const projectUpdateSchema = z.object({
  name: sanitizedString(1, 255).optional(),
  description: sanitizedString(0, 2000).optional().or(z.literal("")),
  location: sanitizedString(0, 500).optional().or(z.literal("")),
  data: z.record(z.string(), z.unknown()).optional(),
});

// Soil layer validation
export const soilLayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  depthTop: z.number().min(0, "Üst derinlik negatif olamaz."),
  depthBottom: z.number().min(0, "Alt derinlik negatif olamaz."),
  soilType: z.enum(["dolgu", "kil", "silt", "kum", "cakil", "kaya"]),
  gamma: z.number().min(10).max(28, "γ değeri 10-28 kN/m³ arasında olmalı."),
  gammaSat: z.number().min(10).max(30).optional(),
  cohesion: z.number().min(0).optional(),
  frictionAngle: z.number().min(0).max(50).optional(),
  elasticity: z.number().min(0).optional(),
  sptN: z.number().min(0).max(100).optional(),
  cu: z.number().min(0).optional(),
  Cc: z.number().min(0).optional(),
  Cs: z.number().min(0).optional(),
  e0: z.number().min(0).max(5).optional(),
  Vs: z.number().min(0).optional(),
}).refine((data) => data.depthBottom > data.depthTop, {
  message: "Alt derinlik, üst derinlikten büyük olmalı.",
  path: ["depthBottom"],
});

// Module input validation helpers
export function validateNumber(value: unknown, min?: number, max?: number): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} alanı zorunludur.`;
  }
  return null;
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (password.length < 8) feedback.push("En az 8 karakter");
  if (!/[A-Z]/.test(password)) feedback.push("Büyük harf ekleyin");
  if (!/[a-z]/.test(password)) feedback.push("Küçük harf ekleyin");
  if (!/[0-9]/.test(password)) feedback.push("Rakam ekleyin");
  if (!/[!@#$%^&*()]/.test(password)) feedback.push("Özel karakter ekleyin");

  return { score: Math.min(score, 5), feedback };
}

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type SoilLayerInput = z.infer<typeof soilLayerSchema>;
