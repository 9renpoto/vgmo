import { listConcerts } from "./concerts.ts";

export async function getStaticPaths() {
  const concerts = await listConcerts();
  return concerts.map((c) => ({
    params: { slug: c.slug },
    props: { concert: c },
  }));
}
