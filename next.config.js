/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent double-mounting of WebGL/ThreeJS canvas in development.
  // React Strict Mode mounts components twice in dev, which causes the 103MB GLTF model's
  // cached GPU buffers to be disposed on the first unmount, crashing the second mount.
  reactStrictMode: false,
};

module.exports = nextConfig;
