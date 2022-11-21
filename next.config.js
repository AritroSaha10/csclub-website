/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  async rewrites() {
    return [
      {
        source: "/fakeapi/:path*",
        destination: "https://testcsclub-project-default-rtdb.firebaseio.com/:path*"
      }
    ]
  }
}

module.exports = nextConfig
