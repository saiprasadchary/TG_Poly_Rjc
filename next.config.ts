import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      { source: "/polycet", destination: "/exam/polycet", permanent: false },
      { source: "/tgrjc", destination: "/exam/tgrjc", permanent: false },
      { source: "/tsrjc", destination: "/exam/tgrjc", permanent: false },
      { source: "/mpc", destination: "/exam/tgrjc/mpc", permanent: false },
      { source: "/exam/tsrjc", destination: "/exam/tgrjc", permanent: false },
      { source: "/exam/tsrjc/mpc", destination: "/exam/tgrjc/mpc", permanent: false }
    ];
  }
};

export default nextConfig;
