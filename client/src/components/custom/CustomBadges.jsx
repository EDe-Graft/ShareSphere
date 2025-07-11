import { Badge } from "@/components/ui/badge";

const ConditionBadge = ({ condition }) => {
  const getConditionProps = (condition) => {
    const normalized = condition?.toLowerCase().trim() || "";

    if (normalized.includes("like-new") || normalized.includes("like new")) {
      return { className: "bg-green-100 text-green-800", text: "Like New" };
    }
    if (normalized.includes("good")) {
      return { className: "bg-blue-100 text-blue-800", text: "Good" };
    }
    if (normalized.includes("fair")) {
      return { className: "bg-amber-100 text-amber-800", text: "Fair" };
    }
    return { className: "bg-gray-100 text-gray-800", text: "Unknown" };
  };

  const { className, text } = getConditionProps(condition);

  return (
    <Badge variant="outline" className={className}>
      {text}
    </Badge>
  );
};

const TypeBadge = ({ text }) => {
  return (
    <Badge
      variant="secondary"
      className="bg-green-200 hover:bg-green-100 text-gray-800 "
    >
      {text}
    </Badge>
  );
};

const AvailabilityBadge = ({ text }) => {
  return (
    <Badge
      variant={text === "Available" ? "destructive" : "secondary"}
      className={
        text === "Available"
          ? "bg-green-200 hover:bg-green-100 text-gray-800 "
          : "text-sm font-medium px-3 py-1"
      }
    >
      {text}
    </Badge>
  );
};

export { ConditionBadge, AvailabilityBadge, TypeBadge };
