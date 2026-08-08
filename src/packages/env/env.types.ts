import type { z } from '@/packages/zod';

import type { publicEnvSchema, serverEnvSchema } from './env.schema';

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
