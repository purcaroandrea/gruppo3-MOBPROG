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