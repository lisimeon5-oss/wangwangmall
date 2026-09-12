const VIDEO_DRAFT_PATH = '/marketing/videoChannel/draftList';

const VIDEO_PAGE_PATHS = {
  待审核列表: VIDEO_DRAFT_PATH,
  草稿列表: VIDEO_DRAFT_PATH,
  'Pending Audit List': VIDEO_DRAFT_PATH,
  'Draft List': VIDEO_DRAFT_PATH,
  รายการรอตรวจสอบ: VIDEO_DRAFT_PATH,
  စစ်ဆေးရန်စောင့်ဆိုင်းစာရင်း: VIDEO_DRAFT_PATH,
  商品列表: '/marketing/videoChannel/list',
  'Product List': '/marketing/videoChannel/list',
  申请接入: '/marketing/videoChannel/apply',
  'Apply Access': '/marketing/videoChannel/apply',
  微信商品类目: '/marketing/videoChannel/weChatcategory',
  'WeChat Product Category': '/marketing/videoChannel/weChatcategory',
};

const VIDEO_PARENT_TITLES = new Set(['视频号', 'Channels', 'ช่องวิดีโอ', 'ဗီဒီယိုချန်နယ်']);

function joinMenuPath(parentPath, path) {
  if (!path) return '';
  if (path.startsWith('/')) return path;
  const base = (parentPath || '').replace(/\/$/, '');
  const joined = `${base}/${path}`.replace(/\/{2,}/g, '/');
  return joined.startsWith('/') ? joined : `/${joined}`;
}

function isVideoChannelBranch(parentPath, parentTitle) {
  return VIDEO_PARENT_TITLES.has(parentTitle) || (parentPath && String(parentPath).indexOf('/videoChannel') !== -1);
}

/**
 * 侧栏 path 来自菜单 component。相对路径会被 el-menu 按当前 URL 解析；
 * 若「待审核列表」还挂着按钮/子菜单，点击只会展开不会跳转。
 */
export function normalizeAdminMenuTree(nodes, parentPath = '', parentTitle = '') {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    const item = Object.assign({}, node);
    let path = joinMenuPath(parentPath, item.path || '');
    const title = item.title || '';
    const underVideo = isVideoChannelBranch(parentPath, parentTitle);
    const pagePath = underVideo ? VIDEO_PAGE_PATHS[title] : '';
    if (item.id === 417 || pagePath) {
      path = pagePath || VIDEO_DRAFT_PATH;
      item.children = [];
    }
    item.path = path;
    if (item.children && item.children.length) {
      item.children = normalizeAdminMenuTree(item.children, path || parentPath, title);
    }
    return item;
  });
}
