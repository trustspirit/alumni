import { memo, useState, useEffect } from 'react';

interface YouTubeBackgroundProps {
  videoId: string;
  className?: string;
}

export const YouTubeBackground = memo(function YouTubeBackground({
  videoId,
  className = '',
}: YouTubeBackgroundProps) {
  const [thumbReady, setThumbReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Preload thumbnail
  useEffect(() => {
    const img = new Image();
    img.src = thumbnailUrl;
    img.onload = () => setThumbReady(true);
  }, [thumbnailUrl]);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gray-900 ${className}`}>
      {/* Thumbnail: fades in when loaded, fades out when video ready */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${thumbReady && !videoReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      {/* Iframe: only mount after thumbnail is shown, fade in when ready */}
      {thumbReady && (
        <iframe
          className={`pointer-events-none absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&vq=small`}
          title="Background video"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          onLoad={() => setTimeout(() => setVideoReady(true), 800)}
          style={{ border: 0 }}
        />
      )}
    </div>
  );
});
