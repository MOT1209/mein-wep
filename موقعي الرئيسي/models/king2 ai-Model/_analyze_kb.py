import json

with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    kb = json.load(f)

entries = kb.get('knowledge', [])
cats = {}
for e in entries:
    cat = e.get('category', 'unknown')
    if cat not in cats:
        cats[cat] = {'count': 0, 'examples': []}
    cats[cat]['count'] += 1
    if len(cats[cat]['examples']) < 2:
        cats[cat]['examples'].append(e.get('question', '')[:60])

for c, info in sorted(cats.items(), key=lambda x: -x[1]['count']):
    print(f'{c}: {info["count"]} entries')
    for ex in info['examples']:
        print(f'  - {ex}')
    print()
