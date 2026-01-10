import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthSkeleton } from "@/components/custom/AuthSkeleton";
import axios from "axios";
import { GitHubEmailDialog } from "@/components/custom/GithubEmailDialog";
import { EmailVerificationDialog } from "@/components/custom/EmailVerificationDialog";

// Define the authentication providers
const providers = [
  { id: "github", name: "GitHub", icon: <Github className="mr-2 h-4 w-4" /> },
  { id: "google", name: "Google", icon: <Mail className="mr-2 h-4 w-4" /> },
  { id: "credentials", name: "Email and Password" },
];

// Form schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Backend configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

export function SignInPage() {
  const { setAuthSuccess, user, setUser, localLogin, socialLogin, logout } =
    useAuth();
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [unverifiedUserData, setUnverifiedUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check email verification status
  const checkEmailVerification = async (email) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/verification-status/${email}`,
        axiosConfig
      );
      console.log("isUserVerified: ", response.data.isVerified)
      return response.data.isVerified;
    } catch (error) {
      console.error("Failed to check verification status:", error);
      return true; // Assume verified if check fails
    }
  };

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Send verification email
  const sendVerificationEmail = async (email, userName) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/send-verification`,
        { email, userName },
        axiosConfig
      );

      return response.data.success;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return false;
    }
  };

  // Handle verification completion
  const handleVerificationComplete = async () => {
    setEmailVerificationOpen(false);

    // If this was from GitHub email collection, continue with GitHub auth
    if (unverifiedUserData?.pendingGithubAuth) {
      const email = unverifiedUserData.email;
      setUnverifiedUserData(null);

      // Now continue with GitHub authentication with the verified email
      await logout(); // Logout to refresh session
      setIsLoading("github");
      handleSocialLogIn(providers[0], { email });
    } else {
      setUnverifiedUserData(null);
      navigate("/", { state: { replace: true } });
    }
  };

  // Handle form submission
  const onSubmit = async (credentials) => {
    setIsLoading("credentials");

    try {
      // Attempt to login
      const response = await localLogin(credentials);

      if (response.data.message === "no user found") {
        // User doesn't exist, redirect to sign-up
        navigate("/sign-up");
        setIsLoading(null);
        return;
      }

      if (response.data.message === "email not verified") {
        // User exists but email not verified
        setUnverifiedUserData({
          email: credentials.email,
          userName: credentials.email.split("@")[0],
        });
        setEmailVerificationOpen(true);
        setIsLoading(null);
        return;
      }

      // User exists and email is verified, complete login
      if (response.data.authSuccess) {
        const user = response.data.user;
        setAuthSuccess(true);
        setUser(user);
        navigate("/", {
          state: { replace: true },
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle social login
  const handleSocialLogIn = async (provider, data = null) => {
    setIsLoading(provider.id);
    try {
      const response = await socialLogin(provider.id, data);
      console.log("Social Login Response", response);

      // Handle case where email is required (GitHub without email)
      if (response.requireEmail) {
        setGithubDialogOpen(true);
        setIsLoading(null);
        return;
      }

      // Handle case where email is not verified
      if (response.emailNotVerified) {
        setUnverifiedUserData({
          email: data?.email || response.email,
          userName: response.name || data?.userName,
        });
        setEmailVerificationOpen(true);
        setIsLoading(null);
        return;
      }

      if (response.error) {
        setError(response.error);
      } else {
        if (response.authSuccess) {
          const user = response.user;
          console.log("User", user);

          // 1. If user has a valid, verified email
          if (user?.email && (user?.verified || user?.emailVerified)) {
            setAuthSuccess(true);
            setUser(user);
            navigate("/", { state: { replace: true } });
            return;
          }

          // 2. If user has an email but it's not verified
          if (provider.id === "github" && user?.email && !user?.emailVerified) {
            // If we already have the email from the dialog, send verification
            if (data?.email) {
              const emailSent = await sendVerificationEmail(
                data.email,
                user.displayName || user.name
              );

              if (emailSent) {
                setUnverifiedUserData({
                  email: data.email,
                  userName: user.name || user.displayName,
                });

                //logout user before verification confirmation
                await logout();

                setGithubDialogOpen(false);
                setEmailVerificationOpen(true);
                return;
              }
            }
            // If we don't have the email from the dialog, just show the verification dialog
            setUnverifiedUserData({
              email: user.email,
              userName: user.name || user.displayName,
            });
            setGithubDialogOpen(false);
            setEmailVerificationOpen(true);
            return;
          }

          // 3. If user has no email, open the GitHub email dialog
          if (provider.id === "github" && !user?.email) {
            setGithubDialogOpen(true);
            return;
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle GitHub email submission
  const handleGithubEmailSubmit = async (data) => {
    setIsLoading("github");

    try {
      // Send verification email first
      const emailSent = await sendVerificationEmail(
        data.email,
        data.email.split("@")[0]
      );

      if (emailSent) {
        // Store the email for later use
        setUnverifiedUserData({
          email: data.email,
          userName: data.email.split("@")[0],
          pendingGithubAuth: true, // Flag to indicate pending GitHub auth
        });

        // Close GitHub dialog and open verification dialog
        setGithubDialogOpen(false);
        setEmailVerificationOpen(true);
        setIsLoading(null);
      } else {
        setError("Failed to send verification email. Please try again.");
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Error in GitHub email submission:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(null);
    }
  };

  // Show skeleton while page is loading
  if (pageLoading) {
    return <AuthSkeleton type="sign-in" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show verification success message if coming from email verification */}
          {location.state?.message && (
            <Alert>
              <AlertDescription>{location.state.message}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogIn(providers[0])}
              disabled={!!isLoading}
              className="w-full"
            >
              {isLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                providers[0].icon
              )}
              {providers[0].name}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogIn(providers[1])}
              disabled={!!isLoading}
              className="w-full"
            >
              {isLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                providers[1].icon
              )}
              {providers[1].name}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={!!isLoading}>
                {isLoading === "credentials" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with credentials"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* GitHub Email Dialog */}
      <GitHubEmailDialog
        isOpen={githubDialogOpen}
        onClose={() => {
          setGithubDialogOpen(false);
          navigate("/", { state: { replace: true } });
        }}
        onSubmit={handleGithubEmailSubmit}
        isLoading={isLoading === "github"}
        title="GitHub Sign Up"
        description="Please provide your email address to continue with GitHub registration."
        submitButtonText="Continue with GitHub"
      />

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        isOpen={emailVerificationOpen}
        onClose={() => setEmailVerificationOpen(false)}
        email={unverifiedUserData?.email || null}
        userName={unverifiedUserData?.userName}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

export default SignInPage;
