import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function AuthSkeleton({ type = "sign-up" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex justify-center">
            <div className="h-4 w-48 bg-muted rounded-md animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                <div className="h-4 w-24 bg-muted rounded-md animate-pulse"></div>
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name field (only for sign-up) */}
            {type === "sign-up" && (
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            </div>

            {/* Confirm Password field (only for sign-up) */}
            {type === "sign-up" && (
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
              </div>
            )}

            {/* Submit button */}
            <div className="h-10 w-full bg-muted rounded-md animate-pulse mt-6"></div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex justify-center w-full">
            <div className="h-4 w-48 bg-muted rounded-md animate-pulse"></div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}