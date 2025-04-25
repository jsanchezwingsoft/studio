'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, MoreHorizontal } from 'lucide-react';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return null;
    } else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-20 bg-gray-200 p-4 flex flex-col items-center justify-between">
          <div className="space-y-4 flex flex-col items-center">
            <Button variant="ghost" className="w-full justify-center"><Menu className="h-6 w-6" /></Button>
            <Button variant="ghost" className="w-full justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-4"/><path d="m22 4-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 4"/></svg></Button>
            <Button variant="ghost" className="w-full justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-headphone"><path d="M4 9v6c0 1.1.9 2 2 2h1m9-8.5a2 2 0 1 1 4 0v8.5"/><path d="M16 15v1a4 4 0 0 1-8 0v-3.5"/><path d="M8 15v1a4 4 0 0 0 8 0v-3.5"/><path d="M4 15v-3c0-1.1.9-2 2-2h1"/></svg></Button>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-400"></div> {/* Placeholder for User Profile */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex space-x-4">
              <div className="bg-white border rounded-md px-4 py-2">Jun 1 - Aug 31, 2024</div> {/* Date Range */}
              <div className="bg-white border rounded-md px-4 py-2">
                <div className="font-bold">7,052</div>
                <div>EOI Sent</div>
              </div>
              <div className="bg-white border rounded-md px-4 py-2">
                <div className="font-bold">34</div>
                <div>New Requests</div>
              </div>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Borrowers by State */}
            <Card className="bg-white border rounded-md">
              <CardHeader className="flex justify-between items-center p-4">
                <CardTitle>Borrowers by State</CardTitle>
                <Button variant="ghost" className="w-10 h-10 p-0 justify-center"><MoreHorizontal className="h-6 w-6" /></Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-center">$25.5M</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>QLD</span>
                    <span className="ml-auto">$18.6M</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <span>SA</span>
                    <span className="ml-auto">$3.9M</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>WA</span>
                    <span className="ml-auto">$3.2M</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span>VIC</span>
                    <span className="ml-auto">$0M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card className="bg-white border rounded-md">
              <CardHeader className="flex justify-between items-center p-4">
                <CardTitle>Map Preview</CardTitle>
                <Button variant="ghost" className="w-10 h-10 p-0 justify-center"><MoreHorizontal className="h-6 w-6" /></Button>
              </CardHeader>
              <CardContent className="relative">
                <div className="w-full h-64 bg-gray-300 mb-4"></div>
                {/* Heat Map */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/70 rounded-md text-white text-sm">
                  $3.2M <br/>Western Australia
                </div>
                {/* Placeholder for Map */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>&lt;60%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <span>&lt;40%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>&lt;20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="bg-white border rounded-md col-span-2">
              <CardHeader className="flex justify-between items-center p-4">
                <CardTitle>Details</CardTitle>
                <Button variant="ghost" className="w-10 h-10 p-0 justify-center"><MoreHorizontal className="h-6 w-6" /></Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div><div className="font-bold text-xl">27.8K</div><div>Opened Request</div></div>
                  <div><div className="font-bold text-xl">67%</div><div>Engaged</div></div>
                  <div><div className="font-bold text-xl">24%</div><div>EOI Sent</div></div>
                </div>
                <div className="w-full h-12 bg-gray-300"></div> {/* Placeholder for Details Bar */}
              </CardContent>
            </Card>

            {/* New Request Trend */}
            <Card className="bg-white border rounded-md col-span-2">
              <CardHeader className="flex justify-between items-center p-4">
                <CardTitle>New Request Trend</CardTitle>
                <Button variant="ghost" className="w-10 h-10 p-0 justify-center"><MoreHorizontal className="h-6 w-6" /></Button>
              </CardHeader>
              <CardContent>
                <div className="w-full h-40 bg-gray-300 mb-4"></div>
                <div className="flex items-center"><div className="font-bold text-sm mr-2">37</div><div>+1.2%</div></div>{/* Placeholder for New Request Trend */}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
    }

}
