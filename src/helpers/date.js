/*
export function addDays(isoDate, amount) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function weekday(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
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
*/

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

