import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SCID — Hướng dẫn Sử dụng',
  tagline: 'Hướng dẫn sử dụng hệ thống ERP của SCID JSC',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
    faster: true,
  },

  url: 'https://document.scid.vn',
  baseUrl: '/',

  organizationName: 'scid-jsc',
  projectName: 'scid-user-guide',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      rel: 'stylesheet',
    },
  ],

  i18n: {
    defaultLocale: 'vi',
    locales: ['vi'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/scid-jsc/scid-user-guide/tree/main/',
          exclude: ['**/dev/**', '**/ops/**', '**/_*/**'],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/halo-pulse.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SCID',
      logo: {
        alt: 'SCID JSC',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/ke-toan/huong-dan/van-hanh', label: 'Kế toán', position: 'left' },
        { to: '/cho-thue/huong-dan/van-hanh-lms', label: 'Cho thuê', position: 'left' },
        { to: '/e-office/huong-dan/van-hanh-eo', label: 'E-Office', position: 'left' },
        { to: '/hrms/huong-dan/van-hanh-hrms', label: 'Nhân sự', position: 'left' },
        { to: '/helpdesk/huong-dan/su-dung-helpdesk', label: 'Helpdesk', position: 'left' },
        {
          href: 'https://github.com/scid-jsc',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Hệ thống',
          items: [
            { label: 'Kế toán (AMS)', to: '/ke-toan/huong-dan/van-hanh' },
            { label: 'Cho thuê (LMS)', to: '/cho-thue/huong-dan/van-hanh-lms' },
            { label: 'E-Office', to: '/e-office/huong-dan/van-hanh-eo' },
            { label: 'Nhân sự (HRMS)', to: '/hrms/huong-dan/van-hanh-hrms' },
          ],
        },
        {
          title: 'Hỗ trợ',
          items: [
            { label: 'Helpdesk', to: '/helpdesk/huong-dan/su-dung-helpdesk' },
            { label: 'GitHub', href: 'https://github.com/scid-jsc' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} SCID JSC`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'vi'],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/',
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],
};

export default config;
