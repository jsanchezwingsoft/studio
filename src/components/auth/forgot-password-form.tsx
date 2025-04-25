"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Mail, Send, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });

   async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    console.log('Password reset request for:', values.email);
    // Simulate API call for password reset request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual password reset logic
    // On successful request:
    toast({
      title: "Password Reset Email Sent",
      description: `If an account exists for ${values.email}, you will receive password reset instructions.`,
    });
    setIsSubmitted(true); // Show confirmation message/state

    // Example error handling (e.g., server error)
    // toast({
    //   variant: "destructive",
    //   title: "Request Failed",
    //   description: "Could not process your request. Please try again later.",
    // });

    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-md card"> {/* Added 'card' class */}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Forgot Your Password?
        </CardTitle>
        <CardDescription>
          {isSubmitted
            ? "Check your email for reset instructions."
            : "Enter your email address and we'll send you a link to reset your password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          className="pl-10"
                          {...field}
                          aria-label="Email"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-primary" disabled={isLoading}> {/* Updated class */}
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Password reset instructions have been sent to your email address.
            Please check your inbox (and spam folder).
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-primary hover:text-primary/80 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
