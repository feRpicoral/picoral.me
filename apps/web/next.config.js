/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    swcMinify: true,
    compiler: {
        styledComponents: true
    }
};

module.exports = nextConfig;
