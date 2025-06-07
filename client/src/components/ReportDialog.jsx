import { useState, useEffect } from "react";
import { AlertTriangle, Flag, Shield, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const REPORT_REASONS = [
  {
    id: "fraud",
    label: "Fraudulent Activity",
    description: "User is posting fake items or scamming others",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    description: "Posting inappropriate or offensive content",
    icon: <Flag className="h-4 w-4" />,
  },
  {
    id: "spam",
    label: "Spam or Duplicate Posts",
    description: "Posting excessive or duplicate content",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "harassment",
    label: "Harassment or Abuse",
    description: "Harassing or abusing other users",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "safety",
    label: "Safety Concerns",
    description: "Posting unsafe or dangerous items",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "other",
    label: "Other",
    description: "Other violations of community guidelines",
    icon: <Flag className="h-4 w-4" />,
  },
];

export function ReportDialog({
  isOpen,
  onClose,
  reportedUser,
  reportedItem,
}) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresEmail, setRequiresEmail] = useState(false);

  useEffect(() => {
    if (user?.authStrategy === 'github') {
      setRequiresEmail(true);
      setEmail("")
    } else {
      setRequiresEmail(false);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    if (!description.trim()) {
      toast.error("Please help us by providing additional details");
      return;
    }

    if (requiresEmail && !email.trim()) {
      toast.error("Please provide your email address");
      return;
    }

    if (requiresEmail && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reporterId: user?.userId,
        reporterName: user?.displayName || user?.name || "N/A",
        reporterEmail: requiresEmail ? email : (user?.email),
        reportedUserId: reportedUser?.id,
        reportedUserName: reportedUser?.name,
        reportedUserEmail: reportedUser?.email,
        itemId: reportedItem?.itemId || null,
        itemName: reportedItem?.name || reportedItem?.title || "N/A",
        itemCategory: reportedItem?.generalCategory || null,
        itemImage: reportedItem?.displayImage,
        itemCondition: reportedItem?.condition,
        reportReason: selectedReason,
        reportDescription: description.trim(),
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const axiosConfig = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      };

      const saveRes = await axios.post(`${BACKEND_URL}/save-report`, reportData, axiosConfig);
      if (saveRes.data.saveSuccess) {
        const reportRes = await axios.post(`${BACKEND_URL}/report-post`, reportData, axiosConfig)

        if (reportRes.data.reportSuccess) {
          toast.success(
            "Report submitted successfully. Our team will review it shortly."
          );
    
          setSelectedReason("");
          setDescription("");
          setEmail("");
          onClose();
        }
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setDescription("");
    setEmail("");
    onClose();
  };

  if (!reportedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Post
          </DialogTitle>
          <DialogDescription>
            Report {reportedUser.name} for violating community guidelines. All
            reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{reportedUser.name}</p>
                {reportedItem && (
                  <p className="text-sm text-muted-foreground">
                    Item: {reportedItem.name || reportedItem.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Reason for reporting *
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
            >
              {REPORT_REASONS.map((reason) => (
                <div
                  key={reason.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem
                    value={reason.id}
                    id={reason.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={reason.id}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {reason.icon}
                      {reason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {requiresEmail && (
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">
                Your Email Address *
              </Label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <p className="text-xs text-muted-foreground">
                We need your email to send you updates about this report
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional details *
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide specific details about the violation. Include any relevant information that will help our team investigate."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/1000 characters
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              False reports may result in action against your account. Please
              only report genuine violations of our community guidelines.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason || !description.trim() || (requiresEmail && !email.trim())}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// import { useState } from "react";
// import { AlertTriangle, Flag, Shield, User, MessageSquare } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useAuth } from "@/components/AuthContext";
// import { toast } from "sonner";
// import axios from "axios";

// const REPORT_REASONS = [
//   {
//     id: "fraud",
//     label: "Fraudulent Activity",
//     description: "User is posting fake items or scamming others",
//     icon: <AlertTriangle className="h-4 w-4" />,
//   },
//   {
//     id: "inappropriate",
//     label: "Inappropriate Content",
//     description: "Posting inappropriate or offensive content",
//     icon: <Flag className="h-4 w-4" />,
//   },
//   {
//     id: "spam",
//     label: "Spam or Duplicate Posts",
//     description: "Posting excessive or duplicate content",
//     icon: <MessageSquare className="h-4 w-4" />,
//   },
//   {
//     id: "harassment",
//     label: "Harassment or Abuse",
//     description: "Harassing or abusing other users",
//     icon: <User className="h-4 w-4" />,
//   },
//   {
//     id: "safety",
//     label: "Safety Concerns",
//     description: "Posting unsafe or dangerous items",
//     icon: <Shield className="h-4 w-4" />,
//   },
//   {
//     id: "other",
//     label: "Other",
//     description: "Other violations of community guidelines",
//     icon: <Flag className="h-4 w-4" />,
//   },
// ];

// export function ReportDialog({
//   isOpen,
//   onClose,
//   reportedUser,
//   reportedItem,
// }) {
//   const { user } = useAuth();
//   const [selectedReason, setSelectedReason] = useState("");
//   const [description, setDescription] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!selectedReason) {
//       toast.error("Please select a reason for reporting");
//       return;
//     }

//     if (!description.trim()) {
//       toast.error("Please help us by providing additional details");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Make an API call to submit the report
//       const reportData = {
//         reporterId: user?.userId,
//         reporterName: user?.displayName || user?.name || "N/A",
//         reporterEmail: user?.email || "edgquansah@gmail.com",
//         reportedUserId: reportedUser?.id,
//         reportedUserName: reportedUser?.name,
//         reportedUserEmail: reportedUser?.email,
//         itemId: reportedItem?.itemId || null,
//         itemName: reportedItem?.name || reportedItem?.title || "N/A",
//         itemCategory: reportedItem?.generalCategory || null,
//         itemImage: reportedItem?.displayImage,
//         itemCondition: reportedItem?.condition,
//         reportReason: selectedReason,
//         reportDescription: description.trim(),
//         timestamp: new Date().toISOString(),
//         status: "pending",
//       };

//       //send email warning to reported user
//       const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
//       const axiosConfig = {
//         headers: { "Content-Type": "application/json" },
//         withCredentials: true
//       };

//       const saveRes = await axios.post(`${BACKEND_URL}/save-report`, reportData, axiosConfig);
//       if (saveRes.data.saveSuccess) {
//         const reportRes = await axios.post(`${BACKEND_URL}/report-post`, reportData, axiosConfig)

//         if (reportRes.data.reportSuccess) {
//           toast.success(
//             "Report submitted successfully. Our team will review it shortly."
//           );
    
//           // Reset form
//           setSelectedReason("");
//           setDescription("");
//           onClose();
//         }
//       }

//     } catch (error) {
//       console.error("Error submitting report:", error);
//       toast.error("Failed to submit report. Please try again.");
//     } finally {
//       setIsSubmitting(false);

//       // setTimeout(() => {
//       //   window.location.reload(), 1500
//       // })
//     }
//   };

//   const handleClose = () => {
//     setSelectedReason("");
//     setDescription("");
//     onClose();
//   };

//   if (!reportedUser) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Flag className="h-5 w-5 text-red-500" />
//             Report Post
//           </DialogTitle>
//           <DialogDescription>
//             Report {reportedUser.name} for violating community guidelines. All
//             reports are reviewed by our moderation team.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6 py-4">
//           {/* User Info */}
//           <div className="bg-muted/50 p-3 rounded-lg">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <User className="h-5 w-5 text-primary" />
//               </div>
//               <div>
//                 <p className="font-medium">{reportedUser.name}</p>
//                 {reportedItem && (
//                   <p className="text-sm text-muted-foreground">
//                     Item: {reportedItem.name || reportedItem.title}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Report Reason */}
//           <div className="space-y-3">
//             <Label className="text-sm font-medium">
//               Reason for reporting *
//             </Label>
//             <RadioGroup
//               value={selectedReason}
//               onValueChange={setSelectedReason}
//             >
//               {REPORT_REASONS.map((reason) => (
//                 <div
//                   key={reason.id}
//                   className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
//                 >
//                   <RadioGroupItem
//                     value={reason.id}
//                     id={reason.id}
//                     className="mt-1"
//                   />
//                   <div className="flex-1">
//                     <Label
//                       htmlFor={reason.id}
//                       className="flex items-center gap-2 font-medium cursor-pointer"
//                     >
//                       {reason.icon}
//                       {reason.label}
//                     </Label>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {reason.description}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>

//           {/* Additional Details */}
//           <div className="space-y-3">
//             <Label htmlFor="description" className="text-sm font-medium">
//               Additional details *
//             </Label>
//             <Textarea
//               id="description"
//               placeholder="Please provide specific details about the violation. Include any relevant information that will help our team investigate."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="min-h-[100px]"
//               maxLength={1000}
//             />
//             <p className="text-xs text-muted-foreground text-right">
//               {description.length}/1000 characters
//             </p>
//           </div>

//           {/* Warning */}
//           <Alert>
//             <AlertTriangle className="h-4 w-4" />
//             <AlertDescription className="text-sm">
//               False reports may result in action against your account. Please
//               only report genuine violations of our community guidelines.
//             </AlertDescription>
//           </Alert>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-4 border-t">
//           <Button
//             variant="outline"
//             onClick={handleClose}
//             disabled={isSubmitting}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             disabled={isSubmitting || !selectedReason || !description.trim()}
//             className="bg-red-600 hover:bg-red-700"
//           >
//             {isSubmitting ? "Submitting..." : "Submit Report"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
