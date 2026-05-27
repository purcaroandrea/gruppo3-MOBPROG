/**
 * Converte un valore testuale o misto in un numero.
 * Se il valore non è valido, restituisce un fallback di 0.
 */
export function toNumber(value) {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

/**
 * Arrotonda un numero decimale a una singola cifra decimale.
 * (es. 1.56 -> 1.6)
 */
export function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * NUOVA LOGICA ORE/MINUTI
 * Converte i minuti totali in una stringa leggibile (es. 90 -> "1h 30m").
 * È ottimizzata per un'interfaccia pulita: nasconde le ore se sono 0,
 * e nasconde i minuti se l'orario è un'ora spaccata.
 */
export function minutesToHM(totalMinutes) {
  const mins = parseInt(totalMinutes, 10) || 0;
  
  if (mins === 0) return "0m";
  
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * NUOVA LOGICA ORE/MINUTI
 * Converte i minuti totali in ore decimali, arrotondate a un decimale 
 * (es. 90 -> 1.5). È essenziale per mantenere funzionanti 
 * i calcoli settimanali nell'Header e nei grafici della Dashboard.
 */
export function minutesToDecimalHours(totalMinutes) {
  const mins = parseInt(totalMinutes, 10) || 0;
  return Math.round((mins / 60) * 10) / 10;
}