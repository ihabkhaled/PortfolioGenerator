import 'server-only';

import { AwsClient } from 'aws4fetch';

/**
 * Owner of `aws4fetch`.
 *
 * A ~4 kB SigV4 signer rather than the AWS SDK: the product makes four kinds of
 * S3 request and needs none of the SDK's surface, while the SDK would add tens
 * of megabytes to a deployment whose main job is rendering HTML.
 */
export interface SignedFetchConfig {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly region: string;
  readonly service: string;
}

export type SignedFetch = (url: string, init: RequestInit) => Promise<Response>;

export function createSignedFetch(config: SignedFetchConfig): SignedFetch {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: config.service,
  });

  return (url, init) => client.fetch(url, init);
}
