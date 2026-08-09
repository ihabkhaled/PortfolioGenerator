import type { AssetRecord } from './asset.types';

export type AssetUploadFormState =
  | { readonly status: 'idle' }
  | { readonly status: 'success'; readonly asset: AssetRecord }
  | {
      readonly status: 'error';
      readonly error:
        | 'invalid-input'
        | 'not-found'
        | 'empty'
        | 'too-large'
        | 'forbidden-extension'
        | 'unknown-extension'
        | 'unsupported-type'
        | 'signature-mismatch'
        | 'extension-mismatch'
        | 'image-unreadable'
        | 'image-too-large'
        | 'image-too-small'
        | 'infected'
        | 'scanner-unavailable'
        | 'rate-limited';
    };

export type AssetUploadAction = (
  previous: AssetUploadFormState,
  formData: FormData,
) => Promise<AssetUploadFormState>;
