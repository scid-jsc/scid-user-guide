import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  main: [
    { type: 'doc', id: 'index', label: 'Trang chủ' },
    {
      type: 'category',
      label: 'Kế toán',
      collapsed: false,
      items: [
        'ke-toan/huong-dan/van-hanh',
        'ke-toan/huong-dan/bao-cao-tt200',
      ],
    },
    {
      type: 'category',
      label: 'Cho thuê',
      collapsed: false,
      items: [
        'cho-thue/huong-dan/van-hanh-lms',
      ],
    },
    {
      type: 'category',
      label: 'E-Office',
      collapsed: false,
      items: [
        'e-office/huong-dan/van-hanh-eo',
      ],
    },
    {
      type: 'category',
      label: 'Nhân sự',
      collapsed: false,
      items: [
        'hrms/huong-dan/van-hanh-hrms',
      ],
    },
    {
      type: 'category',
      label: 'Helpdesk',
      collapsed: false,
      items: [
        'helpdesk/huong-dan/su-dung-helpdesk',
      ],
    },
  ],
};

export default sidebars;
