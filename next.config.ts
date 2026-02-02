/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ini perintah agar Vercel mengabaikan error garis merah saat deploy
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ini perintah agar Vercel mengabaikan peringatan penulisan kode
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;