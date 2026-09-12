import re, io

t = io.open('js/app.98cc6f83.js', encoding='utf-8', errors='ignore').read()

for word in ['??', '??', '????', 'submitAudit', 'productUp', 'handleUp', 'submit_audit']:
    hits = list(re.finditer(re.escape(word), t))
    print('\n### word:', word, 'count:', len(hits))
    for m in hits[:5]:
        s = max(0, m.start() - 120)
        e = m.end() + 80
        print(repr(t[s:e].replace('\n', ' ')))
