// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'giveagift-assets.nyc3.cdn.digitaloceanspaces.com',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default nextConfig;