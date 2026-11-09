# Historical texts in Aksara

Five complete Khmer transcriptions of works by **Krom Ngoy / ក្រមង៉ុយ (1865–1936)** were added on 6 November 2026. Each record includes author, source revision, access date, poetic form, date qualification, verse-row count, and SHA-256 of the imported lines. English display titles are transliterations. English summaries and theme assignments are Aksara editorial descriptions; they are not translations of the poems.

| Work | Date displayed | Pinned text source |
| --- | --- | --- |
| ច្បាប់ល្បើកថ្មី · Chbab Lboek Thmei | 1922 | [Wikisource revision 930559](https://wikisource.org/w/index.php?oldid=930559) |
| ច្បាប់កេរកាលថ្មី · Chbab Kerkal Thmei | 1922 | [Wikisource revision 1231035](https://wikisource.org/w/index.php?oldid=1231035) |
| សេចក្ដីរំលឹកដាស់តឿន · Sechkdei Romleuk Das Toeun | 1931 | [Wikisource revision 930483](https://wikisource.org/w/index.php?oldid=930483) |
| ពាក្យកាព្យប្រដៅជនប្រុសស្រី · Peak Kap Pradau Chon Pros Srey | c. 1935 | [Wikisource revision 930482](https://wikisource.org/w/index.php?oldid=930482) |
| បណ្ដាំក្រមង៉ុយ · Bandam Krom Ngoy | c. 1935 | [Wikisource revision 930560](https://wikisource.org/w/index.php?oldid=930560) |

## Dates and author information

The [Wikisource author bibliography, revision 930477](https://wikisource.org/w/index.php?oldid=930477) supplies the author’s Khmer name, life dates, poetic forms, and dates for these works. The work pages also contain dated headers or date categories. First-edition imprints have not been independently checked, so each reader includes the basis of the displayed date.

For *Peak Kap Pradau Chon Pros Srey*, the author bibliography explicitly says the date is unknown and suggests 1935. For *Bandam Krom Ngoy*, the text header gives 1935 while the bibliography says approximately 1935. Both are displayed as **c. 1935**, with `publicationYear: null` rather than an invented exact year. No publisher or translator is asserted.

## Text and reuse

All five linked work pages identify the originals as **public domain in countries with a copyright term of life plus 70 years or less**. Wikisource contributors receive credit for the transcriptions, and the site links the [CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/) stated in Wikisource’s footer. The imported transcriptions and any formatting adaptations are offered under that same license; this does not impose a license on unrelated application code or sample poems.

The importer joins nonempty table cells with an em space and adds stanza spacing (three source rows per stanza for *Chbab Lboek Thmei*, two for the others). Spelling, punctuation, verse numbering, and order are retained. Invisible-only spacer cells are omitted. This is a reproduction of the online transcription, not a critical edition or a scan-verified text. No English poem translations have been generated or copied.

## Reproduce the import

Run `python3 scripts/import_wikisource.py` to fetch the pinned revisions. To use existing downloads, run `python3 scripts/import_wikisource.py --cache-dir /path/to/cache`; cached files must be named `aksara-lboek.html`, `aksara-kerkal.html`, `aksara-reminders.html`, `aksara-instruction.html`, and `aksara-bandam.html`.

The importer requires a public-domain notice, the expected poem table, at least 50 verse rows, and a closing phrase. It fails rather than silently importing an incomplete text. The imported collection contains 1,723 nonempty verse rows in total. The six pre-existing demonstration works remain explicitly labeled as samples.

## Additional works — 6 November 2026

Four distinct works were added as **excerpts**, not as complete transcriptions. The reader and collection explicitly mark that extent. Only historical Khmer verse is included; no modern translations, blog commentary, or dictionary explanations are copied.

| Work | Attribution | Publication year | Text included |
| --- | --- | --- | --- |
| កាព្យច្បាប់ប្រុស · Kapy Chbab Pros | Ang Duong, attributed by the host | Unknown | Four stanzas following the opening Pali stanza, PDF p. 1 |
| កាព្យច្បាប់ស្រី — ប្រពន្ធ៧ប្រភេទ · Kapy Chbab Srey | Ang Duong, attributed by the host | Unknown | First four stanzas of this seven-types-of-wives version, PDF p. 1 |
| ច្បាប់ព្រះរាជសម្ភារ (រាជនេតិ) · Chbab Rajaneti | Traditionally associated with Preah Reach Samphear | Unknown | Stanzas 1–20 from the linked online transcription |
| និរាសនគរវត្ត · Niras Nokor Wat | Suttantaprija Ind (1859–1924) | 1934 | Two stanzas on the stone lions at Angkor |

### Sources and editorial handling

- **Kapy Chbab Pros:** [source PDF](https://khmerstorylovers1.yolasite.com/resources/Preah%20Ang%20Duong%20-%20Karb%20Jbab%20Pross.pdf), attributed to Ang Duong in the [host’s poetry index](https://khmerstorylovers1.yolasite.com/khmer-poems.php). The original verse is nineteenth-century material attributed to an author who died in 1860; no modern layout is reproduced. The PDF contains no dated imprint, so the publication year is not guessed. The excerpt was manually transcribed against a rendered image because automatic text extraction loses and reorders Khmer glyphs.
- **Kapy Chbab Srey:** [source PDF](https://khmerstorylovers1.yolasite.com/resources/Preah%20Ang%20Duong%20-%20Karb%20Jbab%20Srey.pdf), with the same host attribution and unknown imprint date. This is specifically the seven-types-of-wives text; it is not conflated with other Chbab Srey versions. It is presented as a historical account of gender expectations. The opening four stanzas were checked against the rendered PDF image, preserving its line-ending hyphens. [Ang Duong’s biography](https://en.wikipedia.org/wiki/Ang_Duong) provides the author’s life dates. The original historical verse is public domain; no license is asserted for the host’s modern layout or commentary.
- **Chbab Rajaneti:** the [ជ្រុងមួយ transcription](https://ratanadoc.wordpress.com/2013/01/06/%E1%9E%85%E1%9F%92%E1%9E%94%E1%9E%B6%E1%9E%94%E1%9F%8B%E1%9E%96%E1%9F%92%E1%9E%9A%E1%9F%87%E1%9E%9A%E1%9E%B6%E1%9E%87%E1%9E%9F%E1%9E%98%E1%9F%92%E1%9E%97%E1%9E%B6%E1%9E%9A-%E1%9E%9A%E1%9E%B6/) explicitly supplies twenty numbered stanzas and calls the form Kakagati. Its source is Ly Thaily’s Khmer proverb dictionary. The blog comments confirm that the work continues beyond these twenty stanzas. Only the original historical verse is reproduced, retaining footnote markers whose modern explanations stay on the source. The [poet-king reference](https://en.wikipedia.org/wiki/Thommo_Reachea_II) documents the traditional attribution. The 2013 posting date is not treated as the poem’s publication date.
- **Niras Nokor Wat:** the [Khmer biography](https://sroulnas168.blogspot.com/2016/04/blog-post_9.html) quotes the two historical stanzas reproduced here. [Angkor Database’s edition record](https://angkordatabase.asia/publications/niras-nokor-wat-1934-edition) supplies the 1934 first print publication, Kambuja Suriya issue information, eight-syllable form, and a link to the longer text; its [author reference](https://angkordatabase.asia/authors/ind-suttantaprija) provides life dates. The journey is from 1909, while the linked digital edition was prepared in 2024. These dates are kept distinct. Only Ind’s original Khmer verse, public domain in life-plus-100-or-shorter jurisdictions, is reproduced; modern editorial writing and English translations are not copied.

`src/lib/data/additional-poems.json` records these source URLs, access dates, explicit text extents, attribution qualifications, and checksums. The four excerpts contain 72 nonempty displayed verse lines in total. The separate Wikisource importer continues to reproduce only the original five full-text imports and does not overwrite the additional records.
