import { motion } from "framer-motion";
import { Badge, BookOpen, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConditionBadge from "./ConditionBadge";
import LikeButton from "./LikeButton";

export default function ItemCard ({ item, onViewDetails, likes, isLiked, onLikeToggle, mode, onDelete }) {

  let itemValues;
  if (item.generalCategory === 'Book') {
    itemValues = [item.title, item.author, item.parentCategory, item.year]
  }
  
  else {
    itemValues = [item.name, item.type, item.brand, item.age]
  }

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-[200px] overflow-hidden bg-muted">
        {item.displayImage ? (
          <img
            src={item.displayImage}
            alt={item.generalCategory}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <BookOpen className="h-12 w-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-medium px-3 py-1">
              Borrowed
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2 flex-grow">
        <CardTitle className="text-lg line-clamp-1">{itemValues[0]}</CardTitle>
        <CardDescription className="line-clamp-1">{itemValues[1]}</CardDescription>
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
)};