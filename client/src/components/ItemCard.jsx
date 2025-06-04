import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Flag, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConditionBadge from "./ConditionBadge";
import LikeButton from "./LikeButton";
import { ReportDialog } from "./ReportDialog";
import { useAuth } from "@/components/AuthContext";

const ItemCard = ({
  item,
  onViewDetails,
  likes,
  isLiked,
  onLikeToggle,
  mode,
  additionalBadges = [],
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleViewDetails = () => {
    onViewDetails(item);
  };

  const handleReport = () => {
    setIsReportDialogOpen(true);
  };

  const isOwnItem = user && item.uploadedBy === (user.displayName || user.name);

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg group h-full">
        <div className="relative h-[200px] overflow-hidden">
          <img
            src={item.displayImage || item.images?.[0] || "/placeholder.svg"}
            alt={item.name || item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {additionalBadges.map((badge, index) => (
              <div key={index}>{badge}</div>
            ))}
            <ConditionBadge condition={item.condition?.toLowerCase()} />
          </div>

          {/* More options menu */}
          <div className="absolute top-3 left-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!isOwnItem && (
                  <DropdownMenuItem
                    onClick={handleReport}
                    className="text-red-600"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Report User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge
                variant="destructive"
                className="text-sm font-medium px-3 py-1"
              >
                Reserved
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 pt-3 px-3 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {item.name || item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.brand || item.author || "No brand"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6 py-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between px-3 sm:px-6 pb-4">
          <LikeButton
            itemId={item.itemId}
            likes={likes}
            isLiked={isLiked}
            onLikeToggle={onLikeToggle}
          />
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        reportedUser={{
          id: item.uploaderId || "unknown",
          name: item.uploadedBy || "Unknown User",
        }}
        reportedItem={item}
      />
    </>
  );
};

export default ItemCard;
