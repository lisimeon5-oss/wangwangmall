import json, io

def dump(nodes, depth=0):
    for n in (nodes or []):
        if not isinstance(n, dict):
            continue
        nid = n.get('id')
        name = n.get('name') or n.get('cateName')
        print("  " * depth + "%s %s" % (nid, name))
        for key in ('childList', 'children', 'child'):
            dump(n.get(key), depth + 1)

store = json.load(io.open('probe_category_store_tree.json', encoding='utf-8'))['data']
plat = json.load(io.open('probe_category_plat_tree.json', encoding='utf-8'))['data']

print("=== STORE category tree (full) ===")
dump(store)

print("\n=== PLATFORM category tree (full, up to depth 3) ===")
def dump2(nodes, depth=0):
    if depth > 3:
        return
    for n in (nodes or []):
        if not isinstance(n, dict):
            continue
        name = n.get('name') or n.get('cateName')
        print("  " * depth + "%s %s" % (n.get('id'), name))
        for key in ('childList', 'children', 'child'):
            dump2(n.get(key), depth + 1)
dump2(plat)

