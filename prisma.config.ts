import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load .env.local for development
config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Use direct connection for migrations (not pooled)
    url: env('DIRECT_DATABASE_URL') || env('DATABASE_URL'),
  },
})
