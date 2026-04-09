const apiProxyTarget = (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
