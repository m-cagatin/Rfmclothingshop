// Common color names and their hex codes
const COLOR_MAP: Record<string, string> = {
  // Reds
  'red': '#FF0000',
  'crimson': '#DC143C',
  'maroon': '#800000',
  'burgundy': '#800020',
  'scarlet': '#FF2400',
  
  // Blues
  'blue': '#0000FF',
  'navy': '#000080',
  'royal blue': '#4169E1',
  'sky blue': '#87CEEB',
  'light blue': '#ADD8E6',
  'dark blue': '#00008B',
  
  // Greens
  'green': '#008000',
  'lime': '#00FF00',
  'olive': '#808000',
  'forest green': '#228B22',
  'mint': '#98FF98',
  
  // Yellows/Oranges
  'yellow': '#FFFF00',
  'gold': '#FFD700',
  'orange': '#FFA500',
  'amber': '#FFBF00',
  
  // Purples/Pinks
  'purple': '#800080',
  'violet': '#EE82EE',
  'pink': '#FFC0CB',
  'magenta': '#FF00FF',
  'lavender': '#E6E6FA',
  
  // Neutrals
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'grey': '#808080',
  'silver': '#C0C0C0',
  'beige': '#F5F5DC',
  'brown': '#A52A2A',
  'tan': '#D2B48C',
  
  // Others
  'cyan': '#00FFFF',
  'teal': '#008080',
  'turquoise': '#40E0D0',
  'coral': '#FF7F50',
  'peach': '#FFDAB9',
  'cream': '#FFFDD0',
  'khaki': '#F0E68C',
};

// Reverse map: hex to color name
const HEX_TO_NAME = Object.fromEntries(
  Object.entries(COLOR_MAP).map(([name, hex]) => [hex.toLowerCase(), name])
);

/**
 * Convert color name to hex code
 */
export function colorNameToHex(name: string): string | null {
  const normalized = name.toLowerCase().trim();
  return COLOR_MAP[normalized] || null;
}

/**
 * Convert hex to color name (if exists in our map)
 */
export function hexToColorName(hex: string): string | null {
  const normalized = hex.toLowerCase().trim();
  return HEX_TO_NAME[normalized] || null;
}

/**
 * Convert RGB string to hex (e.g., "rgb(255, 0, 0)" -> "#FF0000")
 */
export function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Validate if string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Parse input and return hex code
 * Supports: color names, hex codes, RGB values
 */
export function parseColorInput(input: string): { hex: string; name: string } | null {
  const trimmed = input.trim();
  
  // Already a valid hex code
  if (isValidHex(trimmed)) {
    const name = hexToColorName(trimmed) || '';
    return { hex: trimmed.toUpperCase(), name };
  }
  
  // Check if it's a color name
  const hexFromName = colorNameToHex(trimmed);
  if (hexFromName) {
    return { hex: hexFromName, name: trimmed };
  }
  
  // Check if it's RGB format
  if (trimmed.startsWith('rgb')) {
    const hex = rgbToHex(trimmed);
    if (hex) {
      const name = hexToColorName(hex) || '';
      return { hex, name };
    }
  }
  
  // Check if it's hex without #
  if (/^[0-9A-F]{6}$/i.test(trimmed)) {
    const hex = `#${trimmed}`.toUpperCase();
    const name = hexToColorName(hex) || '';
    return { hex, name };
  }
  
  return null;
}

/**
 * Get suggested color names based on partial input
 */
export function getSuggestedColors(partial: string): string[] {
  const normalized = partial.toLowerCase().trim();
  if (normalized.length < 2) return [];
  
  return Object.keys(COLOR_MAP)
    .filter(name => name.includes(normalized))
    .slice(0, 5); // Limit to 5 suggestions
}
