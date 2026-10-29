// Copies the site build (npm run build:site) into the ADNS Audio website and
// points the Techno Vinyls page at it, so the releases render on that page.
// Usage: node scripts/copy-to-site.mjs <path to the website repository>

import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const START = "<!-- techno-vinyls:app -->";
const END = "<!-- /techno-vinyls:app -->";

// The page's tags for the build's entry files, between the two markers.
export const replaceAppBlock = (html, entrypoints, publicPath) => {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start < 0 || end < start) {
    throw new Error(
      `The page needs ${START} … ${END} where the app's files go.`
    );
  }
  const tags = entrypoints.map((file) =>
    file.endsWith(".css")
      ? `  <link rel="stylesheet" href="${publicPath}/${file}" />`
      : `  <script defer src="${publicPath}/${file}"></script>`
  );
  return `${html.slice(0, start)}${START}\n${tags.join("\n")}\n  ${html.slice(end)}`;
};

const main = (site) => {
  const page = join(site, "techno-vinyls/index.html");
  if (!existsSync(page)) throw new Error(`No Techno Vinyls page at ${page}`);
  const { entrypoints } = JSON.parse(
    readFileSync("build/asset-manifest.json", "utf8")
  );

  const target = join(site, "techno-vinyls/app");
  rmSync(target, { recursive: true, force: true });
  cpSync("build/static", join(target, "static"), { recursive: true });

  writeFileSync(
    page,
    replaceAppBlock(
      readFileSync(page, "utf8"),
      entrypoints,
      "/techno-vinyls/app"
    )
  );
  console.log(
    `Copied ${entrypoints.join(", ")} to ${target} and updated ${page}.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    console.error(
      "Usage: node scripts/copy-to-site.mjs <path to the website repository>"
    );
    process.exit(1);
  }
  main(process.argv[2]);
}
