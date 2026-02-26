export const SITE_NAME = 'BYUH Alumni Korea Chapter';
export const SITE_DESCRIPTION = '브리검영 대학교 하와이 한국 동문회';

export const EXTERNAL_LINKS = {
  byuh: 'https://www.byuh.edu/',
  byuhAlumni: 'https://alumni.byu.edu/',
  give: 'https://www.byuh.edu/giving',
} as const;

export const SECTION_IDS = {
  hero: 'hero',
  about: 'about',
  events: 'events',
  news: 'news',
  gallery: 'gallery',
  join: 'join',
  give: 'give',
  contact: 'contact',
} as const;

export const UPLOAD_LIMITS = {
  profileImage: 2 * 1024 * 1024,
  eventImage: 5 * 1024 * 1024,
  newsImage: 5 * 1024 * 1024,
  galleryImage: 10 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
