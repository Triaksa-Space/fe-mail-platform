/**
 * Attachment utilities for parsing and handling email attachments
 */

export interface Attachment {
  Filename: string;
  URL: string;
}

/**
 * Parse attachments from various formats (handles both inbox and sent email formats)
 * @param attachments - Can be ListAttachments array, JSON string of URLs, or string array
 * @param listAttachments - Optional ListAttachments array (for inbox emails)
 * @returns Normalized array of Attachment objects
 */
export function parseAttachments(
  attachments?: string | string[] | Attachment[],
  listAttachments?: Attachment[]
): Attachment[] {
  // First check for inbox-style ListAttachments
  if (listAttachments && Array.isArray(listAttachments) && listAttachments.length > 0) {
    return listAttachments;
  }

  // If no attachments provided
  if (!attachments) return [];

  // If already an array of Attachment objects
  if (Array.isArray(attachments)) {
    // Check if it's already Attachment[] format
    if (attachments.length > 0 && typeof attachments[0] === 'object' && 'Filename' in attachments[0]) {
      return attachments as Attachment[];
    }
    // It's a string[] of URLs
    return (attachments as string[]).map(url => ({
      Filename: extractFilenameFromUrl(url),
      URL: url
    }));
  }

  // If it's a JSON string, parse it
  if (typeof attachments === 'string') {
    try {
      const parsed = JSON.parse(attachments);
      if (Array.isArray(parsed)) {
        return parsed.map(url => ({
          Filename: extractFilenameFromUrl(url),
          URL: url
        }));
      }
    } catch (e) {
      console.error('Failed to parse attachments:', e);
    }
  }

  return [];
}

/**
 * Extract filename from URL, removing UUID prefix if present
 * @param url - Full URL to the attachment
 * @returns Clean filename
 */
export function extractFilenameFromUrl(url: string): string {
  if (!url) return 'attachment';

  const parts = url.split('/');
  const fullFilename = parts[parts.length - 1] || 'attachment';

  // Remove UUID prefix if present (format: uuid_filename.ext)
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_filename
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
  if (uuidPattern.test(fullFilename)) {
    return fullFilename.replace(uuidPattern, '');
  }

  // Also handle simple underscore prefix (e.g., "prefix_filename.ext")
  const underscoreIndex = fullFilename.indexOf('_');
  if (underscoreIndex !== -1 && underscoreIndex < 40) {
    // Only remove prefix if it looks like an ID (< 40 chars before underscore)
    return fullFilename.substring(underscoreIndex + 1);
  }

  return fullFilename;
}

/**
 * Get file extension from filename
 * @param filename - Filename with extension
 * @returns Uppercase file extension (e.g., "PDF", "JPEG")
 */
export function getFileExtension(filename: string): string {
  if (!filename) return 'FILE';
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
}

/**
 * Get file type category for icon display
 * @param filename - Filename with extension
 * @returns File type category
 */
export function getFileType(filename: string): 'pdf' | 'image' | 'document' | 'spreadsheet' | 'archive' | 'other' {
  const ext = getFileExtension(filename).toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';

  return 'other';
}

/**
 * Check if email has attachments
 * @param hasAttachments - Boolean flag from API
 * @param attachments - Attachments data in any format
 * @returns True if email has attachments
 */
export function hasEmailAttachments(
  hasAttachments?: boolean,
  attachments?: string | string[] | Attachment[]
): boolean {
  if (hasAttachments) return true;

  const parsed = parseAttachments(attachments);
  return parsed.length > 0;
}
