import assert from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { before, test } from "node:test";
import FeedParser from "feedparser";
import concerts from "../public/data/concerts.json" with { type: "json" };

const rootDir = path.join(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");

before(() => {
  execSync("npm run build", { cwd: rootDir });
});

test("rss.xml", () => {
  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser({});
    const stream = fs.createReadStream(path.join(distDir, "rss.xml"));
    const items: FeedParser.Item[] = [];

    stream.pipe(feedparser);
    feedparser.on("error", reject);
    feedparser.on("readable", function () {
      const meta = this.meta;
      assert.strictEqual(meta.title, "vgmo");
      assert.strictEqual(meta.link, "https://vgmo.vercel.app/");

      let item;
      while ((item = this.read())) {
        items.push(item);
      }
    });

    feedparser.on("end", () => {
      assert.strictEqual(items.length, concerts.length);
      items.forEach((item, i) => {
        const concert = concerts[i];
        assert.strictEqual(item.title, concert.title);
        assert.strictEqual(item.link, concert.sourceUrl);
      });
      resolve();
    });
  });
});
