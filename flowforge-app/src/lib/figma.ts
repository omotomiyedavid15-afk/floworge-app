/**
 * Figma API Client
 * Handles file metadata and frame image exports
 */

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaFileMetadata {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  pages: FigmaPage[];
}

export interface FigmaPage {
  id: string;
  name: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
}

/**
 * Fetches file metadata (pages and frames) from Figma
 */
export async function getFileMetadata(fileKey: string, token: string): Promise<FigmaFileMetadata> {
  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}?depth=2`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Figma API Error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  
  const pages: FigmaPage[] = data.document.children
    .filter((child: any) => child.type === 'CANVAS')
    .map((page: any) => ({
      id: page.id,
      name: page.name,
      frames: page.children
        .filter((child: any) => child.type === 'FRAME')
        .map((frame: any) => ({
          id: frame.id,
          name: frame.name,
        })),
    }));

  return {
    name: data.name,
    lastModified: data.lastModified,
    thumbnailUrl: data.thumbnailUrl,
    pages,
  };
}

/**
 * Fetches frame images from Figma at 2x resolution
 */
export async function getFrameImages(
  fileKey: string, 
  nodeIds: string[], 
  token: string
): Promise<Record<string, string>> {
  const ids = nodeIds.join(',');
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${ids}&format=png&scale=2`, 
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Figma API Error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.images; // Map of nodeId -> imageUrl
}

/**
 * Extracts file key from Figma URL
 */
export function extractFileKey(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}
