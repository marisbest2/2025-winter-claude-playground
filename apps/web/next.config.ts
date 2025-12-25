import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Treat Mastra packages as external on server-side
  serverExternalPackages: ['@mastra/core', '@mastra/memory', '@mastra/libsql'],
}

export default nextConfig
