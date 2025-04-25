"use client"; // This component uses browser APIs (video element)

import React from 'react';

// Placeholder video URL - replace with your actual video file or URL
const videoUrl = "https://videos.pexels.com/video-files/854006/854006-hd_1920_1080_25fps.mp4"; // Example URL

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
      <div className="absolute bg-black/60 top-0 left-0 w-full h-full"></div>
    </div>
  );
};
