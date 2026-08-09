import { scanBufferWithClamAv } from '@/packages/clamav';
import { getServerEnv } from '@/packages/env/server';

const MAX_SMOKE_TIMEOUT_MS = 5000;
const mode = process.argv[2] ?? 'readiness';
const env = getServerEnv();
const connection = {
  host: env.CLAMAV_HOST,
  port: env.CLAMAV_PORT,
  timeoutMs: Math.min(env.CLAMAV_TIMEOUT_MS, MAX_SMOKE_TIMEOUT_MS),
};

if (mode === 'outage') {
  const verdict = await scanBufferWithClamAv(Buffer.from('clamav-outage-probe'), connection);

  if (verdict.status !== 'unavailable') {
    throw new Error(`Expected scanner unavailability, received ${verdict.status}`);
  }

  console.log(JSON.stringify({ check: 'scanner-unavailable', status: 'passed' }));
} else if (mode === 'readiness') {
  const clean = await scanBufferWithClamAv(
    Buffer.from('portfolio-generate-clean-probe'),
    connection,
  );

  if (clean.status !== 'clean') {
    throw new Error(`Expected a clean verdict, received ${clean.status}`);
  }

  // Assemble the canary only in memory so repository scanners never encounter
  // a complete signature on disk.
  const eicarParts = [
    'X5O!P%@',
    'AP[4\\PZX54(P^)7CC)7}$',
    'EICAR-STANDARD-ANTIVIRUS-TEST-FILE',
    '!$H+H*',
  ];
  const infected = await scanBufferWithClamAv(Buffer.from(eicarParts.join('')), connection);

  if (infected.status !== 'infected') {
    throw new Error(`Expected malware rejection, received ${infected.status}`);
  }

  console.log(JSON.stringify({ check: 'clean-and-eicar', status: 'passed' }));
} else {
  throw new Error('Usage: npm run smoke:clamav -- [readiness|outage]');
}
