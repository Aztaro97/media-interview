"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  username: z.string().min(2, "First name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isLoaded) return;

    try {
      const result = await signUp.create({
        username: values.username,
        emailAddress: values.email,
        password: values.password,
      });

      if (result.status === "missing_requirements") {
        const verifyEmailResult = await signUp.prepareEmailAddressVerification();
        setShowOTP(true);
      } else if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        form.setError("root", {
          message: "Failed to sign up. Please try again."
        });
      }
    } catch (err: any) {
      form.setError("root", {
        message: err?.errors?.[0]?.message || "An error occurred during sign up. Please try again."
      });
    }
  };

  const handleOTPComplete = async (value: string) => {
    if (!isLoaded || !signUp) return;
    
    try {
      const verification = await signUp.attemptEmailAddressVerification({
        code: value
      });
      
      if (verification.status === "complete") {
        await setActive({ session: verification.createdSessionId });
        router.push("/dashboard");
      } else {
        form.setError("root", {
          message: "Invalid verification code. Please try again."
        });
      }
    } catch (err: any) {
      form.setError("root", {
        message: err?.errors?.[0]?.message || "Failed to verify code. Please try again."
      });
    }
  };

  if (showOTP) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>Enter the verification code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-sm text-red-500 text-center">
                {form.formState.errors.root.message}
              </div>
            )}
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                value={otpValue}
                onChange={setOtpValue}
                maxLength={6}
                onComplete={handleOTPComplete}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSeparator />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="text-sm text-red-500 text-center">
                  {form.formState.errors.root.message}
                </div>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
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
                      <Input placeholder="Enter your email" {...field} />
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
                      <Input type="password" placeholder="Create a password" {...field} />
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
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}