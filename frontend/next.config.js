/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return []
    }
    
    return [
      {
        source: '/api/ask',
        destination: 'http://localhost:8000/api/ask',
      },
      {
        source: '/api/poll/:path*',
        destination: 'http://localhost:8000/api/poll/:path*',
      },
      {
        source: '/api/ws/:path*',
        destination: 'http://localhost:8000/api/ws/:path*',
      },
    ]
  },
}

module.exports = nextConfig
