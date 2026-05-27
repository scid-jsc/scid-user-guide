import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type Module = {
  icon: string;
  title: string;
  description: string;
  links: { label: string; to: string }[];
};

const MODULES: Module[] = [
  {
    icon: '🧮',
    title: 'Kế toán (AMS)',
    description: 'Hướng dẫn kế toán hàng ngày: hóa đơn, thanh toán, bút toán, e-invoice.',
    links: [
      { label: 'Vận hành Kế toán', to: '/ke-toan/huong-dan/van-hanh' },
      { label: 'Báo cáo TT200', to: '/ke-toan/huong-dan/bao-cao-tt200' },
    ],
  },
  {
    icon: '🏢',
    title: 'Cho thuê (LMS)',
    description: 'Quản lý hợp đồng, khách thuê, mặt bằng trung tâm thương mại.',
    links: [{ label: 'Vận hành Cho thuê', to: '/cho-thue/huong-dan/van-hanh-lms' }],
  },
  {
    icon: '💼',
    title: 'E-Office (EO)',
    description: 'Quản lý công việc, phê duyệt, lịch họp, công văn và văn phòng phẩm.',
    links: [
      { label: 'Vận hành E-Office', to: '/e-office/huong-dan/van-hanh-eo' },
      { label: 'Hồ sơ Tiếp khách', to: '/e-office/huong-dan/hosotk' },
    ],
  },
  {
    icon: '👥',
    title: 'Nhân sự (HRMS)',
    description: 'Hồ sơ nhân viên, hợp đồng lao động, bảng lương, nghỉ phép, chấm công.',
    links: [{ label: 'Vận hành HRMS', to: '/hrms/huong-dan/van-hanh-hrms' }],
  },
  {
    icon: '🎫',
    title: 'Helpdesk',
    description: 'Gửi yêu cầu hỗ trợ IT — hướng dẫn cho các Sense.',
    links: [{ label: 'Sử dụng Helpdesk', to: '/helpdesk/huong-dan/su-dung-helpdesk' }],
  },
];

export function ModuleCards() {
  return (
    <div className={styles.grid}>
      {MODULES.map((m) => (
        <div key={m.title} className={styles.card}>
          <div className={styles.icon} aria-hidden>
            {m.icon}
          </div>
          <h3 className={styles.title}>{m.title}</h3>
          <p className={styles.description}>{m.description}</p>
          <div className={styles.links}>
            {m.links.map((l) => (
              <Link key={l.to} to={l.to} className={styles.link}>
                → {l.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
