export function translateLinkLabel(vm, name) {
  if (!name) return '';
  const key = `linkPicker.names.${name}`;
  const text = vm.$t(key);
  return text === key ? name : text;
}

export function localizeLinkTree(vm, nodes) {
  return (nodes || []).map((node) => ({
    ...node,
    title: translateLinkLabel(vm, node.title || node.name),
    name: translateLinkLabel(vm, node.name),
    children: node.children && node.children.length ? localizeLinkTree(vm, node.children) : node.children,
  }));
}

export function localizeLinkItems(vm, list) {
  return (list || []).map((item) => ({
    ...item,
    name: translateLinkLabel(vm, item.name),
  }));
}
