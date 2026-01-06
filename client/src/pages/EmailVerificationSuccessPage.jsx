import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthSkeleton } from "@/components/custom/AuthSkeleton";
import axios from "axios";
import { useAuth } from "@/components/context/AuthContext";

// Backend configuration
const BACKEND_URL = import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_URL : 'http://localhost:3000';
const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

export function EmailVerificationSuccessPage() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const token = searchParams.get("token");

  // Verify the email token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("No verification token provided");
        setIsVerifying(false);
        setPageLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${BACKEND_URL}/verify-email/`,
          { token },
          axiosConfig
        );

        if (response.data.success) {
          setVerificationResult({
            success: true,
            email: response.data.email,
            message: response.data.message,
          });

        //fetch updated user profile data
          // let userId = user.userId;
          // const profileResponse = await axios.get(
          //   `${BACKEND_URL}/user-profile/${userId}`,
          //   axiosConfig
          // )

          // if (profileResponse.data.success) {
          //   const userData = profileResponse.data.userData;
          //   setUser(userData)
          // }
          
        } else {
          setError(response.data.error || "Verification failed");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setError(
          error.response?.data?.error ||
            "Verification failed. Please try again."
        );
      } finally {
        setIsVerifying(false);
        setTimeout(() => setPageLoading(false), 500);
      }
    };

    verifyToken();
  }, [token]);

  // Auto redirect to sign-in after 5 seconds
  useEffect(() => {
    if (verificationResult?.success) {
      const timer = setTimeout( async () => {
        const logoutSuccess = await logout();
        if (logoutSuccess) {
          navigate("/sign-in", {
            state: {
              message: "Email verified successfully! Please sign in to continue.",
            },
          });
      }}, 5000);

      return () => clearTimeout(timer);
    }
  }, [verificationResult, navigate]);

  // Show skeleton while page is loading
  if (pageLoading) {
    return <AuthSkeleton type="verification" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          {isVerifying ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Verifying Email
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          ) : verificationResult?.success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <Mail className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Email Verified!
              </CardTitle>
              <CardDescription>
                Your email address has been successfully verified.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Verification Failed
              </CardTitle>
              <CardDescription>
                We couldn't verify your email address.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isVerifying ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                This may take a few moments...
              </p>
            </div>
          ) : verificationResult?.success ? (
            <>
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Welcome! Your account is ready.
                  </p>
                  <p className="text-sm text-green-700">
                    Your account for{" "}
                    <span className="font-medium break-all">
                      {verificationResult.email}
                    </span>{" "}
                    is now active.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Email address verified successfully</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Account is now fully activated</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Ready to access your account</span>
                  </div>
                </div>

                <Alert>
                  <ArrowRight className="h-4 w-4" />
                  <AlertDescription>
                    You'll be automatically redirected to the sign-in page in a
                    few seconds, or you can click the button below.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() =>
                    navigate("/sign-in", {
                      state: {
                        message:
                          "Email verified successfully! Please sign in to continue.",
                      },
                    })
                  }
                  className="w-full"
                >
                  Continue to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">This could happen if:</p>
                  <ul className="text-left space-y-1 max-w-xs mx-auto">
                    <li>• The verification link has expired</li>
                    <li>• The link has already been used</li>
                    <li>• The link is invalid or corrupted</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/sign-up")}
                    className="w-full bg-transparent"
                  >
                    Try Signing Up Again
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/sign-in")}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailVerificationSuccessPage;
