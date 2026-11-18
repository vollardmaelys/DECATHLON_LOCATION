import { getEquipment } from './products';

// Hypothèses commerciales : semaine = 6 journées ; forfait 30 jours = 18 journées.
export function rentalEstimate(equipmentId: string, startDate: string, endDate: string) {
  const product = getEquipment(equipmentId);
  const days = Math.round((new Date(endDate + 'T12:00:00Z').valueOf() - new Date(startDate + 'T12:00:00Z').valueOf()) / 86400000);
  if (!product || !Number.isFinite(days) || days < 1 || days > 365) return null;
  const daily = Number(product.dayPrice.replace(/\D/g, ''));
  const week = daily * 6;
  const month = daily * 18;
  // Le forfait couvrant la durée au meilleur prix est retenu ; pas de hausse au changement de palier.
  const remainder = days % 30;
  const remainingPrice = Math.min(remainder * daily, Math.floor(remainder / 7) * week + (remainder % 7) * daily, Math.ceil(remainder / 7) * week, month);
  return { days, daily, week, month, total: Math.floor(days / 30) * month + remainingPrice };
}
export const formatRentalPrice = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F CFP';
