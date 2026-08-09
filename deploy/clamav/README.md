# ClamAV scanner deployment

This stack runs the official ClamAV `1.4_base` image with a persistent virus
database and a bounded TCP proxy. Allocate at least 3 GiB RAM; 4 GiB is the
recommended operating limit.

Start locally:

```bash
docker compose --env-file .env.example up -d
```

Then configure the application:

```text
CLAMAV_ENABLED=true
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310
CLAMAV_TIMEOUT_MS=20000
```

## Production boundary

Do not publish port 3310 to the internet. The clamd protocol has no
authentication and no transport encryption. Deploy this stack on a private
service network or VPN reachable by the application runtime, bind the proxy to
that private address, and restrict ingress to the application egress address.

Vercel Functions cannot run the daemon. A Vercel deployment therefore needs a
private-network connector or an authenticated TLS scan gateway colocated with
this stack. Until that connection exists, keep `CLAMAV_ENABLED=false`; the
production readiness check must treat uploads as unavailable rather than store
unscanned bytes.

The `freshclam` daemon included in the official image updates the persisted
signature volume. Monitor container health, restart failures, signature age,
memory pressure, and scanner latency. Test the connection with the EICAR test
file only in an isolated non-production portfolio and verify it is rejected
before object storage receives bytes.
