/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type checking is done separately via `tsc --noEmit`
    // This works around a Node v24 + Windows EISDIR bug during build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
