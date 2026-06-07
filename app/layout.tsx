import '../src/index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atmos Motion',
  description: 'AI motion design workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
