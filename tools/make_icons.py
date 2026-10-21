"""Renders the web-app icons (PNG) from the same 3x3 block design as the Android launcher icon.
Run once (or after changing the design): python3 tools/make_icons.py   (needs: pip install playwright && playwright install chromium)"""
import asyncio, math, pathlib
from playwright.async_api import async_playwright
BG='#140D3A'
COLS=['#FF3A3A','#FFD400','#2F74FF','#2FCF4F',None,'#FF5FC8','#9A46FF','#FF8C1A','#FF3A3A']
DARK={'#FF3A3A':'#B0101C','#FFD400':'#B38A00','#2F74FF':'#123FAE','#2FCF4F':'#11822A','#FF5FC8':'#BD1D87','#9A46FF':'#5A1AB5','#FF8C1A':'#B55200'}
def art(cx,cy,span):
    """3x3 blocks + centre star, fitting inside a square of side `span` centred on (cx,cy)."""
    S=span/3.4; G=(span-3*S)/2; O=(cx-span/2, cy-span/2); r=S*0.24; out=''
    for i,c in enumerate(COLS):
        if c is None: continue
        x=O[0]+(i%3)*(S+G); y=O[1]+(i//3)*(S+G)
        out+=f'<rect x="{x}" y="{y}" width="{S}" height="{S}" rx="{r}" fill="{DARK[c]}"/>'
        out+=f'<rect x="{x}" y="{y}" width="{S}" height="{S*0.84}" rx="{r}" fill="{c}"/>'
        out+=f'<rect x="{x+S*.2}" y="{y+S*.14}" width="{S*.52}" height="{S*.17}" rx="{S*.085}" fill="#fff" fill-opacity=".65"/>'
        for ex in (0.3,0.58): out+=f'<rect x="{x+S*ex}" y="{y+S*.42}" width="{S*.12}" height="{S*.24}" rx="{S*.06}" fill="#1A1033"/>'
    pts=' '.join(f'{cx+(S*0.68 if k%2==0 else S*0.28)*math.cos(-math.pi/2+k*math.pi/8):.2f},{cy+(S*0.68 if k%2==0 else S*0.28)*math.sin(-math.pi/2+k*math.pi/8):.2f}' for k in range(16))
    return out+f'<polygon points="{pts}" fill="#fff"/>'
def svg(size,kind):
    s=size
    if kind=='any':      # rounded tile, art fills most of it
        body=f'<rect width="{s}" height="{s}" rx="{s*.22}" fill="{BG}"/>'+art(s/2,s/2,s*.74)
    elif kind=='maskable':  # full bleed, art inside the 80% safe zone
        body=f'<rect width="{s}" height="{s}" fill="{BG}"/>'+art(s/2,s/2,s*.52)
    else:                # apple: full bleed (iOS rounds the corners itself)
        body=f'<rect width="{s}" height="{s}" fill="{BG}"/>'+art(s/2,s/2,s*.66)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 {s} {s}">{body}</svg>'
async def main():
    out=pathlib.Path(__file__).resolve().parent.parent/'web'
    jobs=[('icon-192.png',192,'any'),('icon-512.png',512,'any'),('icon-maskable-512.png',512,'maskable'),('apple-touch-icon.png',180,'apple'),('favicon-32.png',32,'any')]
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,size,kind in jobs:
            pg=await b.new_page(viewport={'width':size,'height':size})
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{svg(size,kind)}</body></html>')
            await pg.screenshot(path=str(out/name),omit_background=True);await pg.close()
        await b.close()
asyncio.run(main())
