export function addDays(isoDate, amount) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d); // locale, non UTC
  date.setDate(date.getDate() + amount);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function startOfWeek(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const day = date.getDay() || 7; // 1 = lunedì
  date.setDate(date.getDate() - day + 1);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function weekday(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][date.getDay()];
}

export function isValidDateStrict(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const [year, month, day] = dateString.split("-").map(Number);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  const date = new Date(dateString);
  return (
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    date.getFullYear() === year
  );
}

export function isValidTime(timeString) {
  if (!/^\d{2}:\d{2}$/.test(timeString)) return false;

  const [h, m] = timeString.split(":").map(Number);

  if (h < 0 || h > 23) return false;
  if (m < 0 || m > 59) return false;

  // Impedisce 24:00 (non esiste)
  if (h === 24 && m === 0) return false;

  return true;
}

export function getSessionDaysCount(session) {
  const start = session.date;
  const end = session.endDate || session.date;
  if (!start || !end || start === end) return 1;
  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = date2 - date1;
  if (diffTime < 0) return 1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function getOverlapDaysCount(session, weekStart, weekEnd) {
  const start = session.date;
  const end = session.endDate || session.date;
  
  const overlapStart = start > weekStart ? start : weekStart;
  const overlapEnd = end < weekEnd ? end : weekEnd;
  
  if (overlapStart > overlapEnd) return 0;
  
  const [y1, m1, d1] = overlapStart.split("-").map(Number);
  const [y2, m2, d2] = overlapEnd.split("-").map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = date2 - date1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

