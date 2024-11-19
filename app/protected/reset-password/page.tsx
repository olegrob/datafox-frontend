import { Suspense } from "react";
import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Loading fallback for the form
function FormFallback() {
  return (
    <div className="flex flex-col w-full max-w-md p-4 gap-2 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-10 w-full bg-gray-200 rounded mb-4" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-10 w-full bg-gray-200 rounded mb-4" />
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  );
}

// Client component for the form
function ResetPasswordForm({ message }: { message: Message }) {
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={message} />
    </form>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  const message = await searchParams;
  
  return (
    <Suspense fallback={<FormFallback />}>
      <ResetPasswordForm message={message} />
    </Suspense>
  );
}
