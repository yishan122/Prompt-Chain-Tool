import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'Week 8 Prompt Chain Tool',
  description: 'Humor flavor prompt chain tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
