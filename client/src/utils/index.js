export const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (isNaN(date)) return "Invalid Date";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function dateFormatter(dateString) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate)) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function getInitials(fullName) {
  if (typeof fullName !== "string" || fullName.trim() === "") return "?";
  const names = fullName.trim().split(" ").filter(Boolean); // remove extra spaces
  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
  return initials.join("") || "?";
}


export const PRIOTITYSTYELS = {
  high: "text-red-600",
  medium: "text-yellow-600",
  low: "text-blue-600",
  normal: "text-green-600", // Added for normal priority
};


export const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
  overdue: "bg-red-600",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];