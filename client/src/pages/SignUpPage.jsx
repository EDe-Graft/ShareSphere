import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { AuthSkeleton } from "@/components/AuthSkeleton";

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
import { GitHubEmailDialog } from "@/components/GithubEmailDialog";

// Define the authentication providers
const providers = [
  { id: "github", name: "GitHub", icon: <Github className="mr-2 h-4 w-4" /> },
  { id: "google", name: "Google", icon: <Mail className="mr-2 h-4 w-4" /> },
  { id: "credentials", name: "Email and Password" },
];

// Form schema for validation
const formSchema = z
  .object({
    displayName: z.string().min(1, { message: "Please enter a valid name" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error will show under confirmPassword
  });

export function SignUpPage() {
  const { setAuthSuccess, setUser, register, socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle form submission
  const handleUserRegistration = async (credentials) => {
    setIsLoading("credentials");
    try {
      const response = await register(credentials);

      if (response.data.authSuccess) {
        const user = response.data.user;

        setAuthSuccess(true);
        setUser(user);
        navigate("/"),
          {
            state: { replace: true },
          };
      } else {
        navigate("/sign-up");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle GitHub button click - open dialog
  const handleGithubClick = () => {
    setGithubDialogOpen(true);
  };

  // Handle GitHub email submission
  const handleGithubEmailSubmit = async (data) => {
    setIsLoading("github");
    setGithubDialogOpen(false);

    try {
      const result = await socialLogin("github", { email: data.email });
      if (result.error) {
        setError(result.error);
      } else {
        console.log(result);
        if (result.authSuccess) {
          const user = result.user;
          setAuthSuccess(true);
          setUser(user);
          navigate("/", {
            state: { replace: true },
          });
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle social login
  const handleSocialSignIn = async (provider) => {
    setIsLoading(provider.id);

    try {
      const result = await socialLogin(provider.id);
      if (result.error) {
        setError(result.error);
      } else {
        console.log(result);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  // Show skeleton while page is loading
  if (pageLoading) {
    return <AuthSkeleton type="sign-up" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign up method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              // onClick={() => handleSocialSignIn(providers[0])}
              onClick={handleGithubClick}
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
              onClick={() => handleSocialSignIn(providers[1])}
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
                Or sign up with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUserRegistration)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Name</FormLabel>
                    <FormControl>
                      <Input placeholder="enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
                    Signing up...
                  </>
                ) : (
                  "Sign up with credentials"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* GitHub Email Dialog */}
      <GitHubEmailDialog
        isOpen={githubDialogOpen}
        onClose={() => setGithubDialogOpen(false)}
        onSubmit={handleGithubEmailSubmit}
        isLoading={isLoading === "github"}
        title="GitHub Sign Up"
        description="Please provide your email address to continue with GitHub registration."
        submitButtonText="Continue with GitHub"
      />
    </div>
  );
}

export default SignUpPage;
