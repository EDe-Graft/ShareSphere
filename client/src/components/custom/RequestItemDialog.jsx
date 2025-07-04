import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios"; // Import Axios
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const RequestItemDialog = ({
  item,
  isOpen,
  onClose,
}) => {

  const {user} = useAuth();
  const itemId = item?.itemId;
  const itemCategory = item.generalCategory;

  const [formState, setFormState] = useState({
    name: `${user.name || user.displayName}`,
    email: `${user?.email || user.profileUrl}`,
    // phone: "",
    message: `Hi ${item?.uploadedBy},\n\nI'm interested in the ${
      item?.name || item?.title || `${itemCategory}`
    } ${itemCategory} you uploaded on ShareSphere. Is it still available for pickup?\n\nThanks!`,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  }

  const handleRequestComplete = async (itemId) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/change-availability`,
        { itemId, itemCategory, newAvailability: false}, 
        axiosConfig
        )
        console.log(response)

    } catch (error) {
        console.error("Error: " + error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the request data
      const emailData = {
        uploaderEmail: item.uploaderEmail, // Assuming item.uploaderEmail contains the donor's email
        requesterName: formState.name,
        requesterEmail: formState.email,
        message: formState.message,
        itemName: item?.name || item.title || `${itemCategory}`,
        itemId: item.itemId,
        itemImage: item.displayImage,
        itemCategory: item.generalCategory,
        itemCondition: item.condition
      };

      // Make API call to backend to send email
      
    
      const response = await axios.post(`${BACKEND_URL}/send-request`,
         emailData,
         axiosConfig
      );

      if (response.data.success) {
        setIsSuccess(true);
        
        // After successful submission, call the onRequestComplete callback
        // if (onRequestComplete) {
        //   onRequestComplete(item.id);
        // }
      } else {
        throw new Error(response.data.message || 'Failed to send request');
      }
    } catch (err) {
      setError(err.response?.data?.message || "There was an error sending your request. Please try again.");
      console.error("Error sending request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormState({
      name: "",
      email: "",
      phone: "",
      message: `Hi ${item?.uploadedBy},\n\nI'm interested in the ${
        item?.name || `${itemCategory}`
      } you donated. Is it still available for pickup?\n\nThanks!`,
    });
    setIsSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset the form after the dialog closes
    setTimeout(resetForm, 300);
    handleRequestComplete(itemId)
  };

  // Get the appropriate item type label
  const getItemTypeLabel = () => {
    switch (itemCategory) {
      case "Book":
        return "Book";
      case "Clothing":
        return "Clothing Item";
      case "Furniture":
        return "Furniture Piece";
      default:
        return "Item";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Request this {getItemTypeLabel()}</DialogTitle>
              <DialogDescription>
                Send a message to {item?.uploadedBy} to request this{" "}
                {getItemTypeLabel()}. They will receive your contact information
                and message.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="phone">Your Phone (optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div> */}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Write your message here"
                    rows={5}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Request
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Request Sent Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your message has been sent to {item?.uploadedBy}. They will
                contact you soon.
              </p>
            </div>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

