"""Import five public-domain Khmer poems from pinned Wikisource revisions.

Usage: python3 scripts/import_wikisource.py [--cache-dir /private/tmp]
No dependencies outside Python's standard library. --cache-dir reads previously
fetched aksara-<key>.html files; otherwise the pinned sources are downloaded.
"""
import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
AUTHOR_SOURCE = 'https://wikisource.org/w/index.php?oldid=930477'
WORKS = [
    dict(key='lboek', slug='chbab-lboek-thmei', revision=930559,
         title='Chbab Lboek Thmei', khmer='ច្បាប់ល្បើកថ្មី', theme='Society',
         publicationYear=1922, yearLabel='1922', form='Kakagati (បទកាកគតិ)', stanzaRows=3,
         publicationNote='Dated 1922 in Wikisource’s author bibliography and work category. A first-edition imprint has not been independently checked.',
         description='A didactic poem addressing conduct, education, farming, and everyday social responsibilities.'),
    dict(key='kerkal', slug='chbab-kerkal-thmei', revision=1231035,
         title='Chbab Kerkal Thmei', khmer='ច្បាប់កេរកាលថ្មី', theme='Wisdom',
         publicationYear=1922, yearLabel='1922', form='Prohmkeat (បទព្រហ្មគីតិ)', stanzaRows=2,
         publicationNote='Dated 1922 in Wikisource’s author bibliography and work category. A first-edition imprint has not been independently checked.',
         description='Advice to younger generations on family obligations, judgment, work, and practical life.'),
    dict(key='reminders', slug='sechkdei-romleuk-das-toeun', revision=930483,
         title='Sechkdei Romleuk Das Toeun', khmer='សេចក្ដីរំលឹកដាស់តឿន', theme='Buddhism',
         publicationYear=1931, yearLabel='1931', form='Seven-syllable verse (បទពាក្យ៧)', stanzaRows=2,
         publicationNote='Dated 1931 in Wikisource’s work header and author bibliography. A first-edition imprint has not been independently checked.',
         description='A verse reflection on religious disputes, learning, gratitude, and relations between older and newer traditions.'),
    dict(key='instruction', slug='peak-kap-pradau-chon-pros-srey', revision=930482,
         title='Peak Kap Pradau Chon Pros Srey', khmer='ពាក្យកាព្យប្រដៅជនប្រុសស្រី', theme='Buddhism',
         publicationYear=None, yearLabel='c. 1935', form='Seven-syllable verse (បទពាក្យ៧)', stanzaRows=2,
         publicationNote='Exact publication year unknown. Wikisource’s author bibliography tentatively places the work around 1935; its work category lists 1935.',
         description='Didactic verse on Buddhist observance, ethical conduct, and the responsibilities of religious life.'),
    dict(key='bandam', slug='bandam-krom-ngoy', revision=930560,
         title='Bandam Krom Ngoy', khmer='បណ្ដាំក្រមង៉ុយ', theme='Education',
         publicationYear=None, yearLabel='c. 1935', form='Prohmkeat (បទព្រហ្មគីតិ)', stanzaRows=2,
         publicationNote='Wikisource’s work header gives 1935, while the author bibliography describes the date as approximately 1935. Shown here as circa 1935.',
         description='Krom Ngoy’s counsel on literacy, education, earning a living, and responsibility to family and community.'),
]

class CellText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)
    def handle_starttag(self, tag, attrs):
        if tag == 'br':
            self.parts.append(' ')

def clean_cell(html):
    parser = CellText()
    parser.feed(html)
    text = re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()
    # The source has spacer cells consisting only of invisible separators.
    return text if text.replace('\u200b', '').strip() else ''

def extract(html, stanza_rows):
    if 'This work is in the' not in html or 'public domain' not in html:
        raise ValueError('Public-domain notice missing: review source before importing')
    content = html[html.index('id="mw-content-text"'):]
    table = re.search(r'<table\b[^>]*>(.*?)</table>', content, re.S)
    if not table:
        raise ValueError('Expected poem table missing')
    rows = re.findall(r'<tr\b[^>]*>(.*?)</tr>', table.group(1), re.S)
    lines = []
    for index, row in enumerate(rows):
        cells = [clean_cell(cell) for cell in re.findall(r'<td\b[^>]*>(.*?)</td>', row, re.S)]
        text = '\u2003'.join(cell for cell in cells if cell)
        if not text:
            raise ValueError('Empty verse row: inspect source markup')
        lines.append(text)
        if (index + 1) % stanza_rows == 0 and index + 1 < len(rows):
            lines.append('')
    if len(rows) < 50 or not any('ចប់' in line for line in lines[-4:]):
        raise ValueError('Poem appears incomplete')
    return lines, len(rows)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path)
    args = parser.parse_args()
    output = []
    for work in WORKS:
        url = f'https://wikisource.org/w/index.php?oldid={work["revision"]}'
        if args.cache_dir:
            html = (args.cache_dir / f'aksara-{work["key"]}.html').read_text()
        else:
            request = Request(url, headers={'User-Agent': 'AksaraLiterature/0.1 (public-domain text import)'})
            with urlopen(request, timeout=30) as response:
                html = response.read().decode('utf-8')
        lines, count = extract(html, work['stanzaRows'])
        record = {key: value for key, value in work.items() if key not in ('key', 'revision', 'stanzaRows')}
        record.update(author='Krom Ngoy', authorKhmer='ក្រមង៉ុយ', authorDates='1865–1936',
                      isSample=False, lines=[], khmerLines=lines,
                      source=dict(name='Wikisource', url=url, authorUrl=AUTHOR_SOURCE,
                                  accessed='2026-11-06', revision=work['revision'],
                                  rights='Public domain, as identified by Wikisource’s PD-old notice (life plus 70 years or less).',
                                  license='CC BY-SA 4.0', licenseUrl='https://creativecommons.org/licenses/by-sa/4.0/',
                                  editorialNote='Complete text of the linked Wikisource transcription. Table cells are joined into verse lines, with stanza spacing added; spelling and punctuation are retained. This transcription has not been collated against a printed edition. English titles are transliterations, not poem translations.',
                                  verseRows=count, sha256=hashlib.sha256('\n'.join(lines).encode()).hexdigest()))
        output.append(record)
        print(f'{work["title"]}: {count} verse rows; revision {work["revision"]}')
    destination = ROOT / 'src/lib/data/historical-poems.json'
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
