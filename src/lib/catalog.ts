export const submissionThemes = ['Memory', 'Home', 'Nature', 'Identity', 'Society', 'Wisdom', 'Buddhism', 'Education', 'Family', 'Heritage', 'Love', 'Other'];
export const themeNames: Record<string, string> = {
 'All works': 'កំណាព្យទាំងអស់', Society: 'សង្គម', Wisdom: 'គតិបណ្ឌិត', Buddhism: 'ព្រះពុទ្ធសាសនា', Education: 'ការអប់រំ', Family: 'គ្រួសារ', Heritage: 'បេតិកភណ្ឌ', Memory: 'ការចងចាំ', Home: 'ផ្ទះ', Nature: 'ធម្មជាតិ', Identity: 'អត្តសញ្ញាណ', Love: 'សេចក្ដីស្រឡាញ់', Other: 'ផ្សេងៗ'
};
export const pageSize = 20;
export function normalizeSearch(text: string) {
 return text.normalize('NFC').replace(/\u200b/g, '').toLowerCase().replace(/[០-៩]/g, digit => String('០១២៣៤៥៦៧៨៩'.indexOf(digit)));
}
export function collectionOptions(params: URLSearchParams, locale: string) {
 const requestedPage = Number(params.get('page'));
 return {
  query: (params.get('q') || '').trim().slice(0, 200),
  theme: (params.get('theme') || 'All works').slice(0, 60),
  sort: params.get('sort') === 'desc' ? 'desc' as const : 'asc' as const,
  locale: locale === 'km' ? 'km' as const : 'en' as const,
  page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1
 };
}
export type CollectionOptions = ReturnType<typeof collectionOptions> & { slugs?: string[] };
