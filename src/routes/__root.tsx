import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { copy } from "@/lib/copy";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: copy.documentTitle },
      { name: "description", content: copy.metaDescription },
      { name: "theme-color", content: "#1e4d3c" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: () => (
    <html lang={copy.htmlLang} suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
