import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auckland Primary Schools',
  description: '奥克兰小学统计数据与学生人口一览',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
