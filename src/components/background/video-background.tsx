"use client"; // This component uses browser APIs (video element)

import React from 'react';

// Placeholder video URL - replace with your actual video file or URL
const videoUrl = "https://consoledevops3.wingsoftlab.com/api/v1/buckets/minihackanalyzer/objects/download?preview=true&prefix=f74977ad8e30745fadd8b6e7de3ea1a7eba8be14.mp4&version_id=null"; // Example URL

export const VideoBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]"> {/* z-[-1] ensures it's behind other content */}
      <video
        src={videoUrl}
        autoPlay
        loop
        muted // Muted is often required for autoplay in browsers
        playsInline // Important for mobile compatibility
        className="min-w-full min-h-full absolute object-cover"
      />
      {/* Dark overlay for better text contrast */}
      <div className="absolute bg-black/60 top-0 left-0 w-full h-full"/>
    </div>
  );
};
export default VideoBackground;
