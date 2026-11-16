// Shared types. Only the small sample collection is bundled in the client.
export type Poem = {
 isSample?: boolean;
 isExcerpt?: boolean;
 textExtent?: string;
 authorKhmer?: string;
 authorDates?: string;
 publicationYear?: number | null;
 yearLabel?: string;
 publicationNote?: string;
 form?: string;
 source?: { name: string; url: string; authorUrl: string; accessed: string; revision?: number; credit?: string; editionUrl?: string; rights: string; license?: string; licenseUrl?: string; editorialNote: string; verseRows: number; sha256: string };
 slug: string; author: string; title: string; khmer: string; theme: string; description: string; lines: string[]; khmerLines: string[] };
export type PoemSummary = Pick<Poem, 'slug' | 'author' | 'title' | 'khmer' | 'theme' | 'authorKhmer' | 'isSample' | 'isExcerpt' | 'yearLabel' | 'form'>;
export type PoemStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type Submission = Poem & { id: string; status: PoemStatus; updatedAt: string };
export type CollectionStats = { total: number; sourcedCount: number; sampleCount: number; communityCount: number; themes: string[] };
export type CollectionResult = { poems: PoemSummary[]; total: number; page: number; pageCount: number };
