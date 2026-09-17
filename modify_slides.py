import re

slides_presenters = {
    "2": "Abel Mathew",
    "3": "Abel Mathew",
    "4": "Abel Mathew",
    "5": "Ambady",
    "6": "Ambady",
    "7": "Ambady",
    "8": "Amalmon K H",
    "9": "Amalmon K H",
    "10": "Govind",
    "11": "Govind",
    "12": "Govind",
    "13": "Harigovind",
    "14": "Harigovind",
    "15": "Harigovind"
}

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

for slide_num, name in slides_presenters.items():
    pattern = rf'(<section class="slide[^>]*id="slide-{slide_num}"[^>]*>.*?)(</section>)'
    
    def repl(m):
        slide_html = m.group(1)
        last_div_idx = slide_html.rfind('</div>')
        if last_div_idx != -1:
            badge = f'\n                        <div class="presenter-badge animate-fade-in">\n                            Presenter: {name}\n                        </div>\n                    '
            return slide_html[:last_div_idx] + badge + slide_html[last_div_idx:] + m.group(2)
        return m.group(0)
    
    content = re.sub(pattern, repl, content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Done modifying index.html")
