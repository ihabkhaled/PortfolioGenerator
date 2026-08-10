export interface GalleryLightboxItem {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption: string | null;
}

export interface GalleryLightboxProps {
  readonly items: readonly GalleryLightboxItem[];
  readonly closeLabel: string;
}
