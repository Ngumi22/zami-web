import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

function VerificationErrorContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            The verification link may be invalid or expired.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/resend-verification">
                Resend Verification Email
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerificationErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationErrorContent />
    </Suspense>
  );
}
