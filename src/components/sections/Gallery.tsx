import { memo, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { useGallery } from '@/hooks/useData';
import { SECTION_IDS } from '@/constants';
import { cn } from '@/lib/cn';

interface GallerySectionProps {
  limit?: number;
  showViewMore?: boolean;
}

export const Gallery = memo(function Gallery({ limit = 6, showViewMore = true }: GallerySectionProps) {
  const { t } = useTranslation();
  const { data: allImages = [] } = useGallery();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(allImages.map((img) => img.category));
    return Array.from(cats);
  }, [allImages]);

  const filteredImages = useMemo(() => {
    const filtered = activeCategory === null
      ? allImages
      : allImages.filter((img) => img.category === activeCategory);
    return filtered.slice(0, limit);
  }, [allImages, activeCategory, limit]);

  const handleCategoryChange = useCallback((category: string | null) => {
    setActiveCategory(category);
  }, []);

  return (
    <section id={SECTION_IDS.gallery} className="bg-surface py-20">
      <Container>
        <SectionHeading
          title={t('gallery.title')}
          subtitle={t('gallery.subtitle')}
          viewMoreLink={showViewMore ? '/gallery' : undefined}
          viewMoreLabel={showViewMore ? t('common.viewMore') : undefined}
        />
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeCategory === null
                ? 'bg-byuh-crimson text-white'
                : 'bg-white text-text-secondary hover:bg-gray-200',
            )}
          >
            {t('gallery.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-byuh-crimson text-white'
                  : 'bg-white text-text-secondary hover:bg-gray-200',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => (
            <div key={image.id} className="group overflow-hidden rounded-xl">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
});
