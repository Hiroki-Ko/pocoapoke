// src/constants.ts
export const MASTER_CLASS = {
  SPECIALTY: "specialty",
  ENVIRONMENT: "environment",
  FAVORITE: "favorite",
} as const;

export type MasterClass = (typeof MASTER_CLASS)[keyof typeof MASTER_CLASS];
