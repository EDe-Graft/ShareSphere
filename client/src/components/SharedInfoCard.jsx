import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SharedInfoCard = ({
  itemCategory,
  itemViewRoute,
  itemUploadRoute,
  name,
  description,
  imageUrl,
  isAllCategories,
  onDonateClick,
}) => {
  const navigate = useNavigate();

  // Navigate to each category page
  const handleViewItems = () => {
    navigate(`${itemViewRoute}`);
    window.scrollTo(0, 0);
  };

  const handleUploadItem = () => {
    if (isAllCategories && onDonateClick) {
      // For All Categories, use the custom donate handler to show dialog
      onDonateClick();
    } else {
      // For other categories, navigate to form directly
      navigate(`${itemUploadRoute}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg group h-full">
      <div className="relative h-[180px] sm:h-[200px] md:h-[220px] overflow-hidden">
        <img
          src={imageUrl || "https://via.placeholder.com/400x200"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 bg-white/90 text-primary font-medium hover:bg-white shadow-sm"
        >
          {itemCategory}
        </Badge>
      </div>
      <CardHeader className="pb-2 pt-3 px-3 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-bold tracking-tight">
          {name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2 mt-2 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex-1 sm:flex-initial border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          onClick={handleUploadItem}
        >
          <Heart className="h-3 w-3" />
          Donate
        </Button>
        <Button
          size="sm"
          className="text-xs flex-1 sm:flex-initial bg-primary hover:bg-primary/90"
          onClick={handleViewItems}
        >
          View Items
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SharedInfoCard;
