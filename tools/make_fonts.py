"""Embeds the two game fonts into the game file as small subsets (no Google Fonts request, works offline).
Usage: python3 tools/make_fonts.py <game.html>   (needs: pip install fonttools brotli)
- Subsets tools/fonts/*.ttf to printable ASCII + every non-ASCII character found in the game file.
- Keeps the fonts' copyright/licence name records (SIL OFL 1.1, see tools/fonts/FONTS-LICENSE.txt).
- Writes the @font-face rules between /*FONTS:BEGIN*/ and /*FONTS:END*/ inside the first <style>.
Re-run whenever new text with new characters (e.g. Japanese) is added."""
import base64, io, re, sys, pathlib
from fontTools import subset
from fontTools.ttLib import TTFont
root = pathlib.Path(__file__).resolve().parent
game = pathlib.Path(sys.argv[1]); html = game.read_text(encoding='utf-8')
html_wo = re.sub(r'/\*FONTS:BEGIN\*/.*?/\*FONTS:END\*/', '', html, flags=re.S)
chars = {chr(c) for c in range(0x20, 0x7f)} | {ch for ch in html_wo if ord(ch) > 0x7e and not (0x1F000 <= ord(ch) <= 0x1FAFF) and ch not in '\u200d\ufe0f'}
text = ''.join(sorted(chars))
def make(ttf):
    f = TTFont(root/'fonts'/ttf)
    opts = subset.Options(); opts.flavor = 'woff2'; opts.name_IDs = ['*']; opts.name_languages = ['*']; opts.layout_features = ['*']
    s = subset.Subsetter(opts); s.populate(text=text); s.subset(f)
    buf = io.BytesIO(); f.flavor = 'woff2'; f.save(buf); return buf.getvalue()
faces = [('Dela Gothic One', 'DelaGothicOne-Regular.ttf', 400), ('M PLUS Rounded 1c', 'MPLUSRounded1c-ExtraBold.ttf', 800)]
css = ['/*FONTS:BEGIN*/ /* Dela Gothic One (c) 2020 The Dela Gothic Project Authors; M PLUS Rounded 1c (c) 2016 The Rounded M+ Project Authors; both SIL Open Font License 1.1. Embedded subsets made by tools/make_fonts.py */']
for fam, ttf, w in faces:
    data = make(ttf); print(f'{fam}: {len(data)/1024:.1f} KB woff2 ({len(text)} characters)')
    css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{base64.b64encode(data).decode()}) format('woff2')}}")
css.append('/*FONTS:END*/')
block = '\n'.join(css)
if '/*FONTS:BEGIN*/' in html: html = re.sub(r'/\*FONTS:BEGIN\*/.*?/\*FONTS:END\*/', lambda m: block, html, flags=re.S)
else: html = html.replace('<style>', '<style>\n' + block, 1)
game.write_text(html, encoding='utf-8')
