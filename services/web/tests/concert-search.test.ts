import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { ConcertWithMeta } from "../src/utils/concerts.ts";

// Helper function representing the filtering logic in ConcertSearchPage
function filterConcerts(
  allConcerts: ConcertWithMeta[],
  searchQuery: string,
): ConcertWithMeta[] {
  const q = searchQuery.trim().toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!q) {
    return allConcerts.filter((c) => new Date(c.date) >= today);
  }

  return allConcerts.filter((c) => {
    const titleMatches = c.title.toLowerCase().includes(q);
    const prefectureMatches = c.prefectures?.some((p) =>
      p.toLowerCase().includes(q),
    );
    return titleMatches || prefectureMatches;
  });
}

const sampleConcerts: ConcertWithMeta[] = [
  {
    title: "クロノ・トリガー Concert",
    date: "2010-01-01T00:00:00.000Z",
    ticketUrl: "https://example.com/1",
    sourceUrl: "https://example.com/1",
    prefectures: ["大阪"],
    slug: "2010-chrono",
    image: "https://example.com/img1.jpg",
  },
  {
    title: "FINAL FANTASY Concert",
    date: "2099-01-01T00:00:00.000Z",
    ticketUrl: "https://example.com/2",
    sourceUrl: "https://example.com/2",
    prefectures: ["東京"],
    slug: "2099-ff",
    image: "https://example.com/img2.jpg",
  },
  {
    title: "ドラゴンクエスト Concert",
    date: "2099-05-01T00:00:00.000Z",
    ticketUrl: "https://example.com/3",
    sourceUrl: "https://example.com/3",
    prefectures: ["愛知", "東京"],
    slug: "2099-dq",
    image: "https://example.com/img3.jpg",
  },
];

test("filterConcerts returns only future concerts when searchQuery is empty", () => {
  const result = filterConcerts(sampleConcerts, "");
  assert.equal(result.length, 2);
  assert.equal(result[0].title, "FINAL FANTASY Concert");
  assert.equal(result[1].title, "ドラゴンクエスト Concert");
});

test("filterConcerts matches past and future concerts by title", () => {
  const result = filterConcerts(sampleConcerts, "クロノ");
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "クロノ・トリガー Concert");
});

test("filterConcerts matches concerts by prefecture", () => {
  const result = filterConcerts(sampleConcerts, "大阪");
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "クロノ・トリガー Concert");

  const resultTokyo = filterConcerts(sampleConcerts, "東京");
  assert.equal(resultTokyo.length, 2);
});

test("filterConcerts is case insensitive", () => {
  const result = filterConcerts(sampleConcerts, "final fantasy");
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "FINAL FANTASY Concert");
});
