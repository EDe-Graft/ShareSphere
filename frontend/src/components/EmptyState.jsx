import { useNavigate } from "react-router-dom";
import { BookX, Shirt, Sofa, Package, Star, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ category }) => {
  const navigate = useNavigate();

  // Determine the route and icon based on category
  const getCategoryDetails = (category) => {
    switch (category) {
      case 'book':
        return {
          route: '/books-form',
          icon: <BookX className="h-12 w-12 text-muted-foreground" />,
          title: "No Books Yet",
          description: "There are no books matching your current filters, or no books have been posted yet.",
          actionText: "Post a Book"
        };
      case 'clothing':
        return {
          route: '/clothing-form',
          icon: <Shirt className="h-12 w-12 text-muted-foreground" />,
          title: "No Clothing Yet",
          description: "There are no clothing items matching your current filters, or no clothing has been posted yet.",
          actionText: "Post Clothing"
        };
      case 'furniture':
        return {
          route: '/furniture-form',
          icon: <Sofa className="h-12 w-12 text-muted-foreground" />,
          title: "No Furniture Yet",
          description: "There are no furniture pieces matching your current filters, or no furniture has been posted yet.",
          actionText: "Post Furniture"
        };
      case 'miscellaneous':
        return {
          route: '/miscellaneous-form',
          icon: <Package className="h-12 w-12 text-muted-foreground" />,
          title: "No Misc. Items Yet",
          description: "There are no miscellaneous items matching your current filters, or no items have been posted yet.",
          actionText: "Post an Item"
        };
      case 'favorites':
        return {
          route: '/',
          icon: <Heart className="h-12 w-12 text-muted-foreground" fill="#FF0000" />,
          title: "No Favorites Yet",
          description: "You haven't liked any items yet. Start exploring and add items to your favorites!",
          actionText: "Explore Items"
        };
      case 'post':
        return {
          route: '/',
          icon: <Package className="h-12 w-12 text-muted-foreground" />,
          title: "No Posts Yet",
          description: "You haven't posted any items yet. Start sharing with your community!",
          actionText: "Post an Item"
        };      
      default:
        return {
          route: '/',
          icon: <Gift className="h-12 w-12 text-muted-foreground" />,
          title: "Nothing Here Yet",
          description: "There are no items matching your current filters, or no items have been posted yet.",
          actionText: "Explore Items"
        };
    }
  };
  
  const { route, icon, title, description, actionText } = getCategoryDetails(category);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted/50 rounded-full p-6 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      <Button onClick={() => navigate(route)} className="bg-primary hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" /> 
        {actionText}
      </Button>
    </div>
  );
};

export default EmptyState;