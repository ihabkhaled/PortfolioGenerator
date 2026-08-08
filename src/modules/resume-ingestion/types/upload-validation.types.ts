export interface UploadValidationInput {
  readonly bytes: Uint8Array;
  readonly sizeBytes: number;
  readonly maxBytes: number;
}
