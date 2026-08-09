import 'server-only';

/** Server-only surface: the scanner and the complete gate. */

export { createClamAvScanner } from './providers/clamav-scanner.provider';
export {
  getFileScanner,
  inspectAndScan,
  scanBytes,
  setFileScanner,
} from './services/file-scan.service';
