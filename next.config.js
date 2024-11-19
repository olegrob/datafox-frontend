/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.action.pl',
      'static.also.com',
      'media.also.com',
      'cdn.cs.1worldsync.com',
      'static.elko.cloud',
      'test.metacatalog.info',
      'www.blobs.lt',
      'blobs.lt',
      'www2.f9baltic.com',
      'static3.nordic.pictures',
      'static1.nordic.pictures',
      'static2.nordic.pictures'
    ],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
