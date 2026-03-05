export interface ConcertInfo {
  title: string;
  date: string;
  ticketUrl: string | null;
  sourceUrl: string;
  prefectures: string[];
  imageUrl?: string;
}
