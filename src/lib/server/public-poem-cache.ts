// Per-server cache: other instances pick up editorial changes within 30 seconds.
// Pending reads are shared too, so simultaneous visitors do not duplicate queries.
export function createPublicPoemCache(ttl = 30_000, capacity = 200, now = Date.now) {
 const entries = new Map<string, { expires: number; value: Promise<any> }>();
 return {
  get<T>(key: string, load: () => Promise<T>): Promise<T> {
   const existing = entries.get(key);
   if (existing && existing.expires > now()) return existing.value;
   entries.delete(key);
   if (entries.size >= capacity) entries.delete(entries.keys().next().value!);
   const entry = { expires: now() + ttl, value: Promise.resolve().then(load) };
   entries.set(key, entry);
   entry.value.catch(() => {
    if (entries.get(key) === entry) entries.delete(key);
   });
   return entry.value;
  },
  clear() { entries.clear(); }
 };
}
export const publicPoemCache = createPublicPoemCache();
