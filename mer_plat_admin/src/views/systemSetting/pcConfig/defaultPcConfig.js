/**
 * 经营理念
 */
export const philosophyDefault = () => {
  return {
    tips: 'systemSetting.pcPhilosophyTip',
    maxLength: 10,
    title: 'systemSetting.fieldDescription',
    placeWords: 'systemSetting.pcPleaseEnterDescMax10',
    isNameI18n: true,
    isShowAddBtn: false, //添加按钮
    isShowEdit: false, //删除按钮
    isShowStatus: false, //开启状态
    isShowLinkUrl: false, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: true, //图片地址
    list: [
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        status: false,
        id: 0,
        sort: 0,
      },
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        status: false,
        id: 0,
        sort: 0,
      },
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        status: false,
        id: 0,
        sort: 0,
      },
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        status: false,
        id: 0,
        sort: 0,
      },
    ],
  };
};

/**
 * 友情链接
 */
export const friendlyLinkDefault = () => {
  return {
    tips: 'systemSetting.pcFriendlyLinkTip',
    title: 'application.linkName',
    placeWords: 'systemSetting.pcPleaseEnterLinkName',
    isNameI18n: true,
    isShowAddBtn: true, //添加按钮
    isShowEdit: true, //删除按钮
    isShowStatus: false, //开启状态
    isShowLinkUrl: true, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: false, //图片地址
    defaultList: {
      name: '',
      nameJson: '',
      linkUrl: '',
      id: 0,
      sort: 0,
    },
    list: [
      {
        name: '',
        nameJson: '',
        linkUrl: '',
        id: 0,
        sort: 0,
      },
    ],
  };
};

/**
 * 底部二维码配置
 */
export const bottomQrcodeDefault = () => {
  return {
    tips: 'systemSetting.pcQrcodeTip',
    title: 'application.linkName',
    placeWords: 'systemSetting.pcPleaseEnterTitleMax8',
    isNameI18n: true,
    isShowAddBtn: false, //添加按钮
    isShowEdit: false, //删除按钮
    isShowStatus: false, //开启状态
    isShowLinkUrl: false, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: true, //图片地址
    maxLength: 8,
    list: [
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        id: 0,
        sort: 0,
      },
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        id: 0,
        sort: 0,
      },
    ],
  };
};

/**
 * 商城快捷入口
 */
export const shoppingQuickEntryDefault = () => {
  return {
    tips: 'systemSetting.pcQuickEntryTip',
    title: 'application.linkName',
    placeWords: 'systemSetting.pcPleaseEnterLinkNameMax6',
    isNameI18n: true,
    isShowAddBtn: true, //添加按钮
    isShowEdit: true, //删除按钮
    isShowStatus: false, //开启状态
    isShowLinkUrl: false, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: false, //图片地址
    isShowChildList: true,
    maxLength: 6,
    modelMaxLength: 6,
    linkNameMaxLength: 8,
    modelLinkMaxLength: 7,
    defaultList: {
      name: '',
      nameJson: '',
      imageUrl: '',
      id: 0,
      sort: 0,
      linkList: [
        {
          name: '',
          nameJson: '',
          linkUrl: '',
          id: 0,
          sort: 0,
        },
      ],
    },
    list: [
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        id: 0,
        sort: 0,
        linkList: [
          {
            name: '',
            nameJson: '',
            linkUrl: '',
            id: 0,
            sort: 0,
          },
        ],
      },
    ],
  };
};

/**
 * 首页banner
 */
export const bannerDefault = () => {
  return {
    tips: 'systemSetting.pcBannerTip',
    isNameI18n: true,
    isShowAddBtn: true, //添加按钮
    isShowEdit: true, //删除按钮
    isShowStatus: true, //开启状态
    isShowLinkUrl: true, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: true, //图片地址
    isShowMoreLinkUrl: false, //多条链接
    maxList: 10,
    title: 'content.title',
    placeWords: 'systemSetting.pleaseEnterName',
    defaultList: {
      name: '',
      nameJson: '',
      imageUrl: '',
      status: false,
      linkUrl: '',
      id: 0,
      sort: 0,
    },
    modelMaxLength: 10,
    list: [
      {
        name: '',
        nameJson: '',
        imageUrl: '',
        status: false,
        linkUrl: '',
        id: 0,
        sort: 0,
      },
    ],
  };
};

/**
 * 首页广告
 */
export const advertisementDefault = () => {
  return {
    tips: 'systemSetting.pcAdWidthTip',
    isShowAddBtn: false, //添加按钮
    isShowEdit: false, //删除按钮
    isShowStatus: true, //开启状态
    isShowLinkUrl: true, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: true, //图片地址
    isShowMoreLinkUrl: false, //多条链接
    maxList: 10,
    defaultList: {
      imageUrl: '',
      status: false,
      linkUrl: '',
      id: 0,
    },
    list: [
      {
        imageUrl: '',
        status: false,
        linkUrl: '',
        id: 0,
      },
    ],
  };
};

/**
 * 首页顶部菜单
 */
export const menuDefault = () => {
  return {
    tips: 'systemSetting.pcTopMenuTip',
    isNameI18n: true,
    isShowAddBtn: true, //添加按钮
    isShowEdit: true, //删除按钮
    isShowStatus: true, //开启状态
    isShowLinkUrl: true, //链接地址
    isShowLinkUrlChose: false, //选择地址选项
    isShowImageUrl: false, //图片地址
    isShowMoreLinkUrl: false, //多条链接
    // modelMaxLength: 10,
    maxLength: 6,
    placeWords: 'systemSetting.pcPleaseEnterNameMax6',
    linkPlaceWords: 'systemSetting.pcInternalExternalLinkTip',
    title: 'category.name',
    defaultList: {
      status: false,
      linkUrl: '',
      id: 0,
      sort: 0,
      name: '',
      nameJson: '',
    },
    list: [
      {
        status: false,
        linkUrl: '',
        id: 0,
        sort: 0,
        name: '',
        nameJson: '',
      },
    ],
  };
};
