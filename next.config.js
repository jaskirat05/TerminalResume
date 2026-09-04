/** @type {import('next').NextConfig} */
const nextConfig = {
  // The resume lives in ./knowledge and is read from disk at runtime (not
  // statically imported). Without this, Vercel's file tracing would drop those
  // files from the serverless bundle and the routes would 404 at runtime.
  // In Next 14 this option lives under `experimental`.
  experimental: {
    outputFileTracingIncludes: {
      '/api/chat': ['./knowledge/**/*'],
      '/api/download': ['./knowledge/**/*'],
    },
  },
};

module.exports = nextConfig;
