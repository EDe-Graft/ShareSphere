import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LikeButton({ 
  itemId, 
  isLiked, 
  likes, 
  onLikeToggle,
  isLoading = false 
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLikeToggle(itemId);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        disabled={isLoading}
      >
        <motion.div
          key={`${itemId}-${isLiked}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-5 w-5 ${
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </motion.div>
      </Button>
      <span className="text-sm text-muted-foreground">{likes} likes</span>
    </div>
  );
}
