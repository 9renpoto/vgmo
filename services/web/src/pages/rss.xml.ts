import rss from "@astrojs/rss";
import type { ConcertInfo } from "packages/types/src";
import concerts from "../../public/data/concerts.json";

const parseDate = (date: string) =>
	new Date(date.replace(/[年月日]/g, (match) => (match === "日" ? "" : "/")));

export const GET = () =>
  rss({
    title: "vgmo",
    description: "VGM-Orchestra はビデオゲーム音楽専門のオーケストラです。",
    site: "https://vgmo.vercel.app",
    items: concerts.map((concert: ConcertInfo) => ({
      link: concert.sourceUrl,
      title: concert.title,
      pubDate: parseDate(concert.date),
      description: `${concert.date} ${concert.venue}`,
    })),
    customData: `<language>ja</language>`,
  });
