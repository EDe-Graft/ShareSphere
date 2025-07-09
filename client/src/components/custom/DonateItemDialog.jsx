import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Shirt, Sofa, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DonateItemDialog = ({
  trigger,
  isOpen,
  onOpenChange,
  title = "Choose Donation Category",
  description = "Select the category that best describes the item you want to donate.",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCategorySelection = (formPath) => {
    // Close the dialog
    if (onOpenChange) {
      onOpenChange(false);
    }

    if (user) {
      navigate(formPath);
    } else {
      localStorage.setItem("redirectAfterLogin", formPath);
      navigate("/sign-in");
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-3 py-4">
        <Button
          variant="outline"
          className="justify-start h-auto p-4 hover:bg-accent bg-transparent"
          onClick={() => handleCategorySelection("/books-form")}
        >
          <BookOpen className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Books</div>
            <div className="text-sm text-muted-foreground">
              Textbooks, novels, reference materials
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start h-auto p-4 hover:bg-accent bg-transparent"
          onClick={() => handleCategorySelection("/furniture-form")}
        >
          <Sofa className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Furniture</div>
            <div className="text-sm text-muted-foreground">
              Chairs, desks, tables, storage
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start h-auto p-4 hover:bg-accent bg-transparent"
          onClick={() => handleCategorySelection("/clothing-form")}
        >
          <Shirt className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Clothing</div>
            <div className="text-sm text-muted-foreground">
              Shirts, pants, jackets, accessories
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start h-auto p-4 hover:bg-accent bg-transparent"
          onClick={() => handleCategorySelection("/miscellaneous-form")}
        >
          <Package className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Miscellaneous</div>
            <div className="text-sm text-muted-foreground">
              Electronics, supplies, tools, other items
            </div>
          </div>
        </Button>
      </div>
    </DialogContent>
  );

  // If a custom trigger is provided, use controlled dialog
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // If no trigger provided, return just the controlled dialog content
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

export default DonateItemDialog;
