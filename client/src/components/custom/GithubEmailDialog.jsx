import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Loader2 } from "lucide-react";
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

// GitHub email form schema
const githubEmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function GitHubEmailDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title = "GitHub Sign In",
  description = "Please provide your email address to continue with GitHub authentication.",
  submitButtonText = "Continue with GitHub",
}) {
  // Initialize GitHub email form
  const githubEmailForm = useForm({
    resolver: zodResolver(githubEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const handleSubmit = async (data) => {
    await onSubmit(data);
    githubEmailForm.reset();
  };

  // Handle dialog close
  const handleClose = () => {
    githubEmailForm.reset();
    onClose();
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
                    <Input
                      placeholder="your-email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
