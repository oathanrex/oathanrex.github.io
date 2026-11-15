export type DevToolId = 'base64' | 'color' | 'text' | 'crypto';

export interface DevToolMeta {
  id: DevToolId;
  title: string;
  badge: string;
  description: string;
  keywords: string[];
}

export const DEV_TOOLS_CATALOG: DevToolMeta[] = [
  {
    id: 'base64',
    title: 'Base64 Studio',
    badge: 'Privacy-First',
    description: 'Encode & decode text, images, and files to Base64 data URLs with live preview and zero uploads.',
    keywords: ['base64', 'encode', 'decode', 'image to base64', 'data url', 'b64'],
  },
  {
    id: 'color',
    title: 'OKLCH Color Lab',
    badge: 'Modern CSS',
    description: 'Convert HEX, RGB, HSL to perceptual OKLCH with WCAG contrast checker and palette generator.',
    keywords: ['color', 'oklch', 'hex', 'rgb', 'hsl', 'contrast', 'palette', 'picker'],
  },
  {
    id: 'text',
    title: 'Text & JSON Transformer',
    badge: 'Formatting',
    description: 'Case converter (camelCase, snake_case, kebab-case), string metrics, and JSON prettifier/minifier.',
    keywords: ['case converter', 'json formatter', 'camelcase', 'kebab-case', 'prettify'],
  },
  {
    id: 'crypto',
    title: 'Hash & UUID Generator',
    badge: 'Web Crypto',
    description: 'Cryptographic SHA-256/SHA-512 hashing and instant UUID v4 generator powered by native WebCrypto.',
    keywords: ['hash', 'sha256', 'sha512', 'uuid', 'guid', 'crypto', 'generator'],
  },
];
