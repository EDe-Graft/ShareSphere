import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, BookOpen, MoreVertical, Flag, Trash2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConditionBadge, AvailabilityBadge, TypeBadge } from "./CustomBadges";
import LikeButton from "./LikeButton";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { ReportDialog } from "./ReportDialog";
import { useAuth } from "@/components/context/AuthContext";

export default function ItemCard({
  item,
  onViewDetails,
  likes,
  isLiked,
  onLikeToggle,
  viewMode,
  additionalBadges = [],
  viewPage,
  onDelete,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnItem = item.uploaderId === user?.userId;

  let itemValues;
  if (item.generalCategory === "Book" || item.generalCategory === "book") {
    itemValues = [item.title, item.author, item.parentCategory, item.year];
  } else {
    itemValues = [
      item.name,
      item.type,
      item.brand,
      item.material || item.gender || item.age,
    ];
  }

  const handleReport = () => {
    setIsReportDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(item.itemId, item.generalCategory);
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Grid View Layout
  if (viewMode === "grid") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="relative h-[200px] overflow-hidden bg-muted group">
              {item.displayImage ? (
                <img
                  src={item.displayImage || "/placeholder.svg"}
                  alt={item.generalCategory}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <BookOpen className="h-12 w-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
              )}

              {/* Report menu - only show for items owned by current user */}
              <div className="absolute top-2 right-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                      aria-label="More options"
                    >
                      <MoreVertical className="h-3 w-3 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {!isOwnItem && (
                      <DropdownMenuItem
                        onClick={handleReport}
                        className="text-red-600 cursor-pointer"
                      >
                        <Flag className="mr-2 h-3 w-3" />
                        Report Post
                      </DropdownMenuItem>
                    )}

                    {isOwnItem && (
                      <DropdownMenuItem
                        onClick={handleDeleteClick}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2Icon className="mr-2 h-3 w-3" />
                        Delete Post
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
                    {item.available === "false" ? "Reserved" : "Borrowed"}
                  </Badge>
                </div>
              )}
            </div>
            <CardHeader className="p-4 pb-2 flex-grow">
              <CardTitle className="text-lg line-clamp-1">
                {itemValues[0]}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {itemValues[1]}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 py-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{itemValues[2]}</span>
              </div>
              <p
                className="text-xs text-primary cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${item.uploaderId}`);
                }}
              >
                @{item.uploaderUsername}
              </p>
              {additionalBadges.length > 0 && (
                <div className="flex flex-wrap gap-1">{additionalBadges}</div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <ConditionBadge condition={item.condition} />
                <LikeButton
                  itemId={item.itemId}
                  isLiked={isLiked}
                  likes={likes}
                  onLikeToggle={onLikeToggle}
                />
              </div>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => onViewDetails(item)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Report Dialog - Reports both user and item from card view */}
        <ReportDialog
          isOpen={isReportDialogOpen}
          onClose={() => setIsReportDialogOpen(false)}
          reportedUser={{
            id: item.uploaderId || "unknown",
            name: item.uploadedBy || "Unknown User",
          }}
          reportedItem={item}
          reportType="item"
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={itemValues[0]}
          itemType={item.generalCategory}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  // if viewMode === "list": List View Layout.
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-[150px] sm:w-[150px] overflow-hidden bg-muted">
              {item.displayImage ? (
                <img
                  src={item.displayImage || "/placeholder.svg"}
                  alt={item.name || item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <BookOpen className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
              )}

              {!item.available && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <TypeBadge
                    variant="destructive"
                    className="text-sm font-medium px-3 py-1"
                  >
                    {item.available === "false" ? "Reserved" : "Borrowed"}
                  </TypeBadge>
                </div>
              )}
            </div>

            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{itemValues[0]}</h3>
                    <TypeBadge
                      text={
                        item.size ||
                        item.brand ||
                        item.estimatedValue ||
                        item.subCategory
                      }
                    />
                    <AvailabilityBadge
                      text={
                        item.available === "true" ? "Available" : "Reserved"
                      }
                    />
                  </div>
                  <p className="text-muted-foreground">{itemValues[1]}</p>
                  <p
                    className="text-xs text-primary cursor-pointer hover:underline mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${item.uploaderId}`);
                    }}
                  >
                    @{item.uploaderUsername}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ConditionBadge condition={item.condition?.toLowerCase()} />
                </div>

                {/* Report menu - only show for items not owned by current user */}
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-7 ml-3 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-2 w-3 text-foreground" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={5}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {!isOwnItem && (
                        <DropdownMenuItem
                          onClick={handleReport}
                          className="text-red-600 cursor-pointer"
                        >
                          <Flag className="mr-2 h-3 w-3" />
                          Report Post
                        </DropdownMenuItem>
                      )}

                      {isOwnItem && (
                        <DropdownMenuItem
                          onClick={handleDeleteClick}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2Icon className="mr-2 h-3 w-3" />
                          Delete Post
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {/* Show different info based on item type */}
                  {item.generalCategory === "Book" ||
                  item.generalCategory === "book"
                    ? `${item.edition || "Unknown Edition"} • ${item.year || "Unknown Year"}`
                    : `${item.brand} • ${item.color || item.age || item.gender}`}
                </div>
                <div className="flex items-center gap-2">
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
                    onClick={() => onViewDetails(item)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        reportedUser={{
          id: item.uploaderId,
          name: item.uploadedBy,
          email: item.uploaderEmail,
        }}
        reportedItem={item}
        reportType="item"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={itemValues[0]}
        itemType={item.generalCategory}
        isDeleting={isDeleting}
      />
    </>
  );
}
