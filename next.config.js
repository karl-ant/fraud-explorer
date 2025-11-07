/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ANT_API_KEY: process.env.ANT_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
};

module.exports = nextConfig;