# Generează public/assets/og.jpg (1200x630) – imaginea de previzualizare pentru Facebook/WhatsApp
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1200, 630
RED = (227, 6, 19)
img = Image.new('RGB', (W, H), (0, 0, 0))
ph = Image.open('public/media/site/lavinia-copii-obstacole.jpg').convert('RGB')
pw = 560
s = max(pw / ph.width, H / ph.height); ph = ph.resize((round(ph.width * s), round(ph.height * s)), Image.LANCZOS)
top = int((ph.height - H) * 0.45); ph = ph.crop(((ph.width - pw) // 2, top, (ph.width - pw) // 2 + pw, top + H))
img.paste(ph, (0, 0))
# fade spre negru
grad = Image.new('L', (pw, H)); g = ImageDraw.Draw(grad)
for x in range(pw):
    g.line([(x, 0), (x, H)], fill=int(255 * max(0, (x - pw * 0.55) / (pw * 0.45)) ** 1.4))
img.paste(Image.new('RGB', (pw, H), (0, 0, 0)), (0, 0), grad)
d = ImageDraw.Draw(img)
logo = Image.open('public/assets/logo.png').convert('RGBA')
lw = 330; logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
x0 = 600
img.paste(logo, (x0, 120), logo)
fb = ImageFont.truetype('public/assets/fonts/Play-Bold.ttf', 50)
fr = ImageFont.truetype('public/assets/fonts/Play-Regular.ttf', 28)
y = 120 + logo.height + 40
d.text((x0, y), 'SALĂ DE SPORTURI', font=fb, fill=(255, 255, 255)); y += 60
d.text((x0, y), 'CU ', font=fb, fill=(255, 255, 255)); d.text((x0 + d.textlength('CU ', font=fb), y), 'OBSTACOLE', font=fb, fill=RED); y += 80
d.rectangle([x0, y, x0 + 70, y + 5], fill=RED); y += 25
d.text((x0, y), 'Splaiul Unirii 160, București', font=fr, fill=(220, 220, 220)); y += 38
d.text((x0, y), 'ninjasport.ro', font=fr, fill=(220, 220, 220))
d.rectangle([0, H - 8, W, H], fill=RED)
img.save('public/assets/og.jpg', quality=85, optimize=True)
