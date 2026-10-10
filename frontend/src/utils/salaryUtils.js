const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fyLabel = (start) => `${start}-${String((start + 1) % 100).padStart(2, "0")}`;

const currentFYStart = () => {
  const d = new Date();
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
};

export const CURRENT_FY = fyLabel(currentFYStart());

export const FY_OPTIONS = Array.from({ length: 6 }, (_, i) =>
  fyLabel(currentFYStart() - i)
);

// April se March ke 12 months
export const monthsOfFY = (fy) => {
  const start = Number(String(fy).split("-")[0]);

  return Array.from({ length: 12 }, (_, i) => {
    const m = ((3 + i) % 12) + 1;
    const y = m >= 4 ? start : start + 1;

    return {
      value: `${y}-${String(m).padStart(2, "0")}`,
      label: `${MONTH_NAMES[m - 1]} ${y}`,
    };
  });
};

export const monthLabel = (value) => {
  const [y, m] = String(value).split("-");
  return `${MONTH_NAMES[Number(m) - 1] || ""} ${y}`;
};

export const fmt = (value) =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });