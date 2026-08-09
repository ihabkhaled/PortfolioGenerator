export function containsBytes(bytes: Uint8Array, marker: Uint8Array): boolean {
  if (marker.length === 0 || marker.length > bytes.length) return false;

  for (const offset of bytes.keys()) {
    if (
      offset <= bytes.length - marker.length &&
      marker.every((value, index) => bytes[offset + index] === value)
    )
      return true;
  }

  return false;
}
