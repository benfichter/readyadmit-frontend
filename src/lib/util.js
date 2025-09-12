export const cn = (...s) => s.filter(Boolean).join(" ");
export const words = (s='') => (s.trim()? s.trim().split(/\s+/).length : 0);
export const clamp = (n,min=0,max=1)=> Math.max(min, Math.min(max, n));