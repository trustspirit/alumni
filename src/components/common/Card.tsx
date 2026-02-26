import { memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface CardProps {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  link?: string;
  meta?: string;
  className?: string;
}

function isExternalLinkSafe(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isInternalLinkSafe(path: string): boolean {
  return path.startsWith('/');
}

export const Card = memo(function Card({
  title,
  description,
  imageUrl,
  imageAlt,
  link,
  meta,
  className,
}: CardProps) {
  const content = (
    <div className={cn(
      'group overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg',
      className,
    )}>
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        {meta && (
          <span className="mb-2 block text-sm text-text-secondary">{meta}</span>
        )}
        <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
    </div>
  );

  if (link && (link.startsWith('http:') || link.startsWith('https:')) && isExternalLinkSafe(link)) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  if (link && isInternalLinkSafe(link)) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
});
