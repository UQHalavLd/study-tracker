import type { GoogleBookResult } from "@/lib/types";

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams({
    q: query,
    maxResults: "10",
    printType: "books",
    langRestrict: "tr",
  });

  if (apiKey) {
    params.append("key", apiKey);
  }

  const response = await fetch(`${GOOGLE_BOOKS_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Google Books API hatası: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item: Record<string, unknown>) => {
    const volumeInfo = item.volumeInfo as Record<string, unknown>;
    const industryIdentifiers = (volumeInfo.industryIdentifiers as Array<{ type: string; identifier: string }>) || [];
    const imageLinks = volumeInfo.imageLinks as Record<string, string> | undefined;
    const isbn13 = industryIdentifiers.find(
      (id) => id.type === "ISBN_13"
    );
    const isbn10 = industryIdentifiers.find(
      (id) => id.type === "ISBN_10"
    );

    return {
      id: item.id as string,
      title: (volumeInfo.title as string) || "Bilinmeyen Kitap",
      authors: (volumeInfo.authors as string[]) || [],
      pageCount: (volumeInfo.pageCount as number) || 0,
      imageLinks: imageLinks
        ? {
            thumbnail: imageLinks.thumbnail?.replace("http:", "https:") || "",
            smallThumbnail: imageLinks.smallThumbnail?.replace("http:", "https:") || "",
          }
        : undefined,
      isbn: isbn13?.identifier || isbn10?.identifier || undefined,
    } satisfies GoogleBookResult;
  });
}

export async function searchBookByISBN(isbn: string): Promise<GoogleBookResult | null> {
  const results = await searchBooks(`isbn:${isbn}`);
  return results.length > 0 ? results[0] : null;
}
