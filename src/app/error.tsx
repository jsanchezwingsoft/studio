'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
     <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">Something went wrong!</CardTitle>
          <CardDescription>An unexpected error occurred.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Please try again later.'}
          </p>
           {/* Optionally display digest in development */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">Digest: {error.digest}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            variant="destructive"
          >
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
