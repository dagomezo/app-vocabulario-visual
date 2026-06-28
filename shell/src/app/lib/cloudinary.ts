export function getThumbnailUrl(url: string | undefined | null, width = 200): string {
  if (!url || !url.includes('res.cloudinary.com')) return url || '';
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
