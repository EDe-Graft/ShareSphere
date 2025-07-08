import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { useAuth } from "../context/AuthContext";


export default function DonateItemDialog () {
    const {user} = useAuth();

    
    return (
        <div>
            {/* Donate Item Dialog */}
            <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Donate Item
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>Choose Donation Category</DialogTitle>
                    <DialogDescription>
                        Select the category that best describes the item you want to
                        donate.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-4">
                    <Button
                        variant="outline"
                        className="justify-start h-auto p-4 "
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
                        className="justify-start h-auto p-4 "
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
                        className="justify-start h-auto p-4 "
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
                        className="justify-start h-auto p-4 "
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
            </Dialog>
        </div>
    )
}