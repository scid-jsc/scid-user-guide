import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type Stat = { value: string; label: string };
type Tile = {
  id: string;
  size: 'large' | 'tall' | 'medium' | 'wide';
  icon: string;
  badge?: string;
  title: string;
  description: string;
  href: string;
  stats?: Stat[];
  variant?: 'navy' | 'mint' | 'amber' | 'plain';
};

const TILES: Tile[] = [
  {
    id: 'ke-toan',
    size: 'large',
    variant: 'navy',
    icon: '🧮',
    badge: 'ams · odoo 16',
    title: 'Kế toán (AMS)',
    description:
      'Phân hệ kế toán chính: hóa đơn, thanh toán, bút toán, e-invoice và báo cáo Thông tư 200.',
    href: '/ke-toan/huong-dan/van-hanh',
    stats: [
      { value: '2', label: 'tài liệu' },
      { value: '300+', label: 'screenshots' },
      { value: 'v1.2', label: 'phiên bản' },
    ],
  },
  {
    id: 'helpdesk',
    size: 'tall',
    variant: 'mint',
    icon: '🎫',
    badge: 'scid.vn/helpdesk',
    title: 'Helpdesk',
    description: 'Gửi yêu cầu hỗ trợ IT — ban hành cho các đơn vị Sense.',
    href: '/helpdesk/huong-dan/su-dung-helpdesk',
  },
  {
    id: 'cho-thue',
    size: 'medium',
    variant: 'plain',
    icon: '🏢',
    title: 'Cho thuê (LMS)',
    description: 'Hợp đồng, khách thuê, mặt bằng trung tâm thương mại.',
    href: '/cho-thue/huong-dan/van-hanh-lms',
  },
  {
    id: 'e-office',
    size: 'medium',
    variant: 'plain',
    icon: '💼',
    title: 'E-Office',
    description: 'Công việc, phê duyệt, lịch họp, công văn, văn phòng phẩm.',
    href: '/e-office/huong-dan/van-hanh-eo',
  },
  {
    id: 'nhan-su',
    size: 'wide',
    variant: 'plain',
    icon: '👥',
    badge: 'odoo 18',
    title: 'Nhân sự (HRMS)',
    description: 'Hồ sơ nhân viên, hợp đồng lao động, bảng lương, nghỉ phép, chấm công.',
    href: '/hrms/huong-dan/van-hanh-hrms',
  },
  {
    id: 'bao-cao',
    size: 'wide',
    variant: 'amber',
    icon: '⚡',
    badge: 'thông tư 200',
    title: 'Báo cáo TT200',
    description: 'Hướng dẫn xuất báo cáo Kế toán theo Thông tư 200.',
    href: '/ke-toan/huong-dan/bao-cao-tt200',
  },
];

function Tile({ tile }: { tile: Tile }) {
  const variantClass = styles[`variant_${tile.variant ?? 'plain'}`];
  const sizeClass = styles[`size_${tile.size}`];
  return (
    <Link
      to={tile.href}
      className={`${styles.tile} ${sizeClass} ${variantClass}`}
      aria-label={tile.title}
    >
      <div className={styles.tileHead}>
        <div className={styles.tileIcon} aria-hidden>
          {tile.icon}
        </div>
        {tile.badge && <span className={styles.tileBadge}>{tile.badge}</span>}
      </div>

      <div className={styles.tileBody}>
        <h3 className={styles.tileTitle}>{tile.title}</h3>
        <p className={styles.tileDesc}>{tile.description}</p>
      </div>

      {tile.stats && (
        <div className={styles.statRow}>
          {tile.stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.tileArrow} aria-hidden>
        ↗
      </div>
    </Link>
  );
}

export function ModuleCards() {
  return (
    <div className={styles.bento}>
      {TILES.map((tile) => (
        <Tile key={tile.id} tile={tile} />
      ))}
    </div>
  );
}
