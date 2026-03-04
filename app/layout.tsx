import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '奥克兰小学数据一览 | Auckland Primary Schools',
    template: '%s | Auckland Primary Schools',
  },
  description:
    '汇集奥克兰 North Shore、Auckland City、Waitakere City 等区域小学的学生人口趋势与学校统计数据，帮助家长全面了解各校情况。',
  keywords: [
    'Auckland',
    'Primary School',
    'New Zealand',
    '奥克兰小学',
    'North Shore',
    'Waitakere',
    'school roll',
    'student population',
    'decile rating',
    '学校统计',
  ],
  authors: [{ name: 'jotcmoney' }],
  openGraph: {
    title: '奥克兰小学数据一览',
    description:
      '汇集奥克兰各区域小学的学生人口趋势与学校统计数据，帮助家长全面了解各校情况。',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
