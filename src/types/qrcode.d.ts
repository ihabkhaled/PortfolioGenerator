declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    margin?: number;
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
}
