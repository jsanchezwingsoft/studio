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
import { useRouter } from 'next/navigation';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    user_id: string;
    username: string;
    email: string;
    role: string;
  };
}
interface ApiError {
  detail?: string | { msg: string; type: string }[];
}

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
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
    const loginEndpoint = "https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/login";
    console.log(`Attempting to POST to: ${loginEndpoint}`);
    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // CORREGIDO: JSON
          'accept': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,      // CORREGIDO: email
          password: values.password // CORREGIDO: password
        }),
      // Sending the email and password to the API
      });
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        let errorMessage = `Login failed: ${response.statusText} (Status: ${response.status})`;
        let errorData: ApiError | null = null;
        try {
          errorData = await response.json();
          if (typeof errorData?.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData?.detail) && errorData.detail[0]?.msg) {
             errorMessage = errorData.detail[0].msg;
          }
          console.error('API Error Response Body:', errorData);
        } catch (e) {
          console.error("Failed to parse error response JSON:", e);
          const textResponse = await response.text();
          console.error('API Error Response Text:', textResponse);
        }
        if (response.status === 0) {
            errorMessage = 'Network error or CORS issue. Check browser console & server CORS configuration.';
        }
        throw new Error(errorMessage);
      }
      // Login successful
      const data: LoginResponse = await response.json();
      console.log('Login successful, API Response:', data);
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user.username}! Access Granted.`,
        variant: 'default',
      });
      sessionStorage.setItem('accessToken', data.access_token);
      sessionStorage.setItem('refreshToken', data.refresh_token);
      router.push('/');
    } catch (error) {
      console.error('Caught error during login fetch:', error);
      let toastMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toastMessage = 'Network error: Could not connect to the server. This might be due to a network issue, the server being down, or a CORS policy blocking the request. Please check your network connection and the browser console (Network tab) for more details (e.g., CORS errors). The backend server MUST be configured to allow requests from this frontend origin.';
          console.error("Detailed 'Failed to fetch' error likely indicates Network or CORS issue. Check the browser's Network tab.");
      } else if (error instanceof Error) {
          toastMessage = error.message;
      }
      toast({
        title: "Login Failed",
        description: toastMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md card animate-fade-in">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold cyber-flicker">
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
                  <FormLabel>Email / Username</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@domain.com"
                        className="pl-10"
                        {...field}
                        aria-label="Email or Username"
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        className="pl-10"
                        {...field}
                        aria-label="Password"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
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
        <Link href="/forgot-password" className="text-sm text-accent hover:text-accent/80 hover:underline transition-colors">
          Forgot Password?
        </Link>
        {/* Add Register link if applicable */}
        {/* <span className="mx-2 text-muted-foreground">|</span>
        <Link href="/register" className="text-sm text-accent hover:text-accent/80 hover:underline transition-colors">
          Register
        </Link> */}
      </CardFooter>
    </Card>
  );
}