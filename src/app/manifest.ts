import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ceritaria",
    short_name: "Ceritaria",
    description: "Nonton mini series drama Ceritaria dari episode ke episode.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    lang: "id",
    categories: ["entertainment"],
    icons: [
      { src: "/pwa/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Lanjut Nonton",
        short_name: "Lanjut",
        url: "/lanjut",
        icons: [{ src: "/pwa/icon-192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Cari Cerita",
        short_name: "Cari",
        url: "/search",
        icons: [{ src: "/pwa/icon-192", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
