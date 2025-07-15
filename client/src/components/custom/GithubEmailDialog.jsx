import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// GitHub email form schema
const githubEmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// Backend configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

// Verify Email Exists
const verifyEmailExists = async (email) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/verify-email`,
      { email },
      axiosConfig
    );

    console.log(response.data)

    return {
      isValid: response.data.isValid,
      reason: response.data.reason,
      confidence: response.data.confidence || null,
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      isValid: false,
      reason: `Verification error: ${error.response?.data?.message || error.message}`,
    };
  }
};

export function GitHubEmailDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title = "GitHub Sign In",
  description = "Please provide your email address to continue with GitHub authentication.",
  submitButtonText = "Continue with GitHub",
}) {
  const [emailVerification, setEmailVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  // Initialize GitHub email form
  const githubEmailForm = useForm({
    resolver: zodResolver(githubEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle email verification
  const handleEmailVerification = async (email) => {
    if (!email || !email.includes("@")) {
      setEmailVerification(null);
      setVerificationAttempted(false);
      return;
    }

    setIsVerifying(true);
    setVerificationAttempted(true);

    try {
      const result = await verifyEmailExists(email);
      setEmailVerification(result);

    } catch (error) {
      setEmailVerification({
        isValid: false,
        reason: "Unable to verify email at this time",
        confidence: 'low'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    // If we haven't verified yet, do it now
    if (!verificationAttempted) {
      await handleEmailVerification(data.email);
      return;
    }

    // Check if email is valid before submitting
    if (emailVerification && !emailVerification.isValid) {
      return; // Don't submit if email is invalid
    }

    await onSubmit(data);
    githubEmailForm.reset();
    setEmailVerification(null);
    setVerificationAttempted(false);
  };

  // Handle dialog close
  const handleClose = () => {
    githubEmailForm.reset();
    onClose();
  };

  // Get verification status icon
  const getVerificationIcon = () => {
    if (isVerifying) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (emailVerification?.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (emailVerification?.isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (verificationAttempted) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  // Get verification status message
  const getVerificationMessage = () => {
    if (isVerifying) {
      return "Verifying email address...";
    }
    if (emailVerification?.isValid === true) {
      return "✓ Email address verified and deliverable";
    }
    if (emailVerification?.isValid === false) {
      return `✗ ${emailVerification.reason}`;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...githubEmailForm}>
          <form
            onSubmit={githubEmailForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={githubEmailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="your-email@example.com"
                        type="email"
                        {...field}
                        className={`${
                          emailVerification?.isValid === false
                            ? "border-red-500 focus:border-red-500"
                            : emailVerification?.isValid === true
                              ? "border-green-500 focus:border-green-500"
                              : ""
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getVerificationIcon()}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Verification Status */}
            {(isVerifying || emailVerification) && (
              <Alert
                variant={
                  emailVerification?.isValid === false
                    ? "destructive"
                    : "default"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getVerificationMessage()}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              {!verificationAttempted ? (
                <Button
                  type="button"
                  onClick={() =>
                    handleEmailVerification(githubEmailForm.getValues("email"))
                  }
                  disabled={!githubEmailForm.getValues("email") || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || emailVerification?.isValid === false}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    submitButtonText
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
