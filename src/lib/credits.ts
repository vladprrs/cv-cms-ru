import { z } from 'zod';

export const PACKS = [
  { id: 'starter', name: 'Starter', credits: 3, priceRub: 299 },
  { id: 'standard', name: 'Standard', credits: 15, priceRub: 699 },
  { id: 'bulk', name: 'Bulk', credits: 50, priceRub: 1500 },
] as const;

export type PackId = (typeof PACKS)[number]['id'];

export const packIdSchema = z.enum(['starter', 'standard', 'bulk']);

export function getPackById(packId: string) {
  return PACKS.find((p) => p.id === packId);
}
