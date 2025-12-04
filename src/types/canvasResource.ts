/**
 * Canvas Resource Types
 */

export interface CanvasGraphic {
  id: number;
  name: string;
  cloudinary_url: string;
  thumbnail_url: string;
  cloudinary_public_id: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  category?: string;
  tags?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CanvasPattern {
  id: number;
  name: string;
  cloudinary_url: string;
  thumbnail_url: string;
  cloudinary_public_id: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  is_seamless: boolean;
  tags?: any;
  created_at: Date;
  updated_at: Date;
}

export type GraphicCategory = 'icon' | 'logo' | 'illustration' | 'template';

export interface UploadResourceData {
  name: string;
  cloudinary_url: string;
  thumbnail_url: string;
  cloudinary_public_id: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  category?: string;
  tags?: any;
  is_seamless?: boolean;
}
