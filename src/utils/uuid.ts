/**
 * Generate a simple unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a campaign slug from the campaign title
 */
export function generateCampaignSlug(title: string): string {
  return createSlugFromTitle(title);
}

/**
 * Create a URL-friendly slug from campaign title
 */
export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 50 characters
    .substring(0, 50)
    // Remove trailing hyphen if created by substring
    .replace(/-+$/, '');
}



/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate if a string is a valid campaign slug
 */
export function isValidCampaignSlug(slug: string): boolean {
  // Allow slugs (letters, numbers, hyphens) and UUIDs for backward compatibility
  const slugRegex = /^[a-z0-9-]+$/i;
  return slugRegex.test(slug) && slug.length > 0;
}

/**
 * Extract campaign ID from a campaign URL
 */
export function extractCampaignId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const campaignIndex = pathParts.indexOf('campaign');
    
    if (campaignIndex !== -1 && pathParts[campaignIndex + 1]) {
      const id = pathParts[campaignIndex + 1];
      return isValidCampaignSlug(id) ? id : null;
    }
    
    return null;
  } catch {
    return null;
  }
}/*
*
 * Generate a unique campaign slug with collision handling
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  const baseSlug = createSlugFromTitle(title);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Handle collisions by adding a number suffix
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}