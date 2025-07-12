import { useState } from "react";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

export function EmailVerificationDialog({
  isOpen,
  onClose,
  email,
  userName,
  onVerificationComplete,
}) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage("");
    setResendError("");

    try {
      const response = await axios.post(
        `${BACKEND_URL}/resend-verification`,
        { email },
        axiosConfig
      );

      if (response.data.success) {
        setResendMessage("Verification email sent successfully!");
      } else {
        setResendError(response.data.error || "Failed to resend email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendError(
        error.response?.data?.error || "Network error. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Verify Your Email
          </DialogTitle>
          <DialogDescription>
            {userName
              ? "We've sent a verification email to confirm your account."
              : "Please verify your email address before signing in."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">
              {userName ? "Check Your Email" : "Email Verification Required"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {userName
                ? "We've sent a verification link to:"
                : "Please verify your email address to continue:"}
            </p>
            <p className="font-medium text-blue-600 break-all">{email}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Click the verification link in your email</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Check your spam folder if you don't see it</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>The link expires in 24 hours</span>
            </div>
          </div>

          {resendMessage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}

          {resendError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-transparent"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <Button variant="ghost" onClick={onClose} className="w-full">
              {userName ? "I'll Verify Later" : "Back to Sign In"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
