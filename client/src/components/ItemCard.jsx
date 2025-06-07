// "use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge, BookOpen, MoreVertical, Flag } from "lucide-react";
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
import ConditionBadge from "./ConditionBadge";
import LikeButton from "./LikeButton";
import { ReportDialog } from "./ReportDialog";
import { useAuth } from "@/components/AuthContext";

export default function ItemCard({
  item,
  onViewDetails,
  likes,
  isLiked,
  onLikeToggle,
}) {
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  let itemValues;
  if (item.generalCategory === "Book") {
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

  const isOwnItem = user && item.uploadedBy === (user.displayName || user.name);

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

            {!isOwnItem && (
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                    >
                      <MoreVertical className="h-3 w-3 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleReport}
                      className="text-red-600 cursor-pointer"
                    >
                      Report Post
                      <Flag className="mr-2 h-3 w-3" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {!item.available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge
                  variant="destructive"
                  className="text-sm font-medium px-3 py-1"
                >
                  Borrowed
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

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        reportedUser={{
          id: item.uploaderId,
          name: item.uploadedBy,
          email: item.uploaderEmail
        }}
        reportedItem={item}
      />
    </>
  );
}
