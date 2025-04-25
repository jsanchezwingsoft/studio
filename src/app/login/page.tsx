'use client';
import React from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { VideoBackground } from '@/components/background/video-background';

export default function LoginPage() {
  return (
    <main className='relative h-screen w-screen overflow-hidden'>
        <VideoBackground/>
        <div className="relative flex items-center justify-center h-screen ">
            <LoginForm />
        </div>
    </main>
  );
}
