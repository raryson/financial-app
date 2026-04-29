import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinanceApp — Dashboard de Gastos",
    short_name: "FinanceApp",
    description:
      "Visualize e analise seus gastos do Nubank. 100% no navegador, sem envio de dados.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#820ad1",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
