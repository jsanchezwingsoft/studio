"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Mail, Lock, LogIn } from 'lucide-react';

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

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }), // Increased min length
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    console.log('Login attempt with:', values);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual authentication logic
    // For demonstration, always show success
    toast({
      title: "Login Successful",
      description: "Access Granted. Redirecting...",
      variant: 'default', // Use default for success
    });

    // Example error handling:
    // toast({
    //   variant: "destructive",
    //   title: "Login Failed",
    //   description: "Authentication Error: Invalid Credentials.",
    // });

    setIsLoading(false);
    // TODO: Redirect to the dashboard or appropriate page on successful login
    // router.push('/dashboard');
  }

  return (
    <Card className="w-full max-w-md card"> {/* Added 'card' class */}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-primary cyber-flicker"> {/* Applied cyber-flicker */}
          MiniHack Analyzer Login
        </CardTitle>
        <CardDescription>
          Authenticate to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Email</FormLabel> {/* Adjusted label color */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@domain.com" // Updated placeholder
                        className="pl-10" // Added input class
                        {...field}
                        aria-label="Email"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Password</FormLabel> {/* Adjusted label color */}
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••" // Updated placeholder
                        className="pl-10" // Added input class
                        {...field}
                        aria-label="Password"
                       />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full btn-primary" disabled={isLoading}> {/* Updated class */}
              {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="flex justify-center">
         <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"> {/* Added transition */}
            Forgot Password?
          </Link>
      </CardFooter>
    </Card>
  );
}
