export function findMenuTitleByPath(path, ...menuLists) {
  if (!path) return '';
  const walk = (arr) => {
    if (!Array.isArray(arr)) return '';
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item) continue;
      if (item.path === path && item.title) return item.title;
      const child = walk(item.children);
      if (child) return child;
    }
    return '';
  };
  for (let i = 0; i < menuLists.length; i++) {
    const found = walk(menuLists[i]);
    if (found) return found;
  }
  return '';
}

export function resolveNavTitle(rawTitle, path, ...menuLists) {
  return findMenuTitleByPath(path, ...menuLists) || rawTitle || '';
}
