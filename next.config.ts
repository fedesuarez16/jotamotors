import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // public/ no se empaqueta en las funciones serverless; el PDF y el mail de
  // cotizaciones leen el logo con fs, así que hay que incluirlo explícitamente.
  outputFileTracingIncludes: {
    "/cotizaciones": ["./public/logo-jotamotors.jpeg"],
    "/cotizaciones/**": ["./public/logo-jotamotors.jpeg"],
  },
};

export default nextConfig;
