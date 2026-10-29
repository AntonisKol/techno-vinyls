import { test } from "node:test";
import assert from "node:assert/strict";
import { replaceAppBlock } from "./copy-to-site.mjs";

const page = `<main>
  <div id="techno-vinyls"></div>
</main>
<!-- techno-vinyls:app -->
  <script defer src="/techno-vinyls/app/static/js/main.old.js"></script>
  <!-- /techno-vinyls:app -->
</body>`;

test("points the page at the new build's files", () => {
  const html = replaceAppBlock(
    page,
    ["static/js/main.new.js"],
    "/techno-vinyls/app"
  );
  assert.match(
    html,
    /<script defer src="\/techno-vinyls\/app\/static\/js\/main\.new\.js"><\/script>/
  );
  assert.doesNotMatch(html, /main\.old\.js/);
  assert.match(html, /<div id="techno-vinyls"><\/div>/);
});

test("links a stylesheet when the build has one", () => {
  const html = replaceAppBlock(
    page,
    ["static/css/main.1.css", "static/js/main.1.js"],
    "/techno-vinyls/app"
  );
  assert.match(
    html,
    /<link rel="stylesheet" href="\/techno-vinyls\/app\/static\/css\/main\.1\.css" \/>/
  );
});

test("keeps the markers, so the next build can replace the block again", () => {
  const once = replaceAppBlock(page, ["static/js/a.js"], "/x");
  const twice = replaceAppBlock(once, ["static/js/b.js"], "/x");
  assert.match(twice, /b\.js/);
  assert.doesNotMatch(twice, /a\.js/);
});

test("refuses a page without the markers", () => {
  assert.throws(
    () => replaceAppBlock("<main></main>", ["static/js/a.js"], "/x"),
    /needs/
  );
});
