import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nobodhara Aryan Society | নবধারা আরিয়ান সোসাইটি',
  description: 'পরিকল্পিত ও আধুনিক পরিবেশবান্ধব আবাসন প্রকল্প - নবধারা আরিয়ান সোসাইটি। আপনার স্বপ্নের প্লট বুকিং করুন আজই।',
  keywords: ['Nobodhara Aryan Society', 'Housing Society Bangladesh', 'Plot Sale Dhaka', 'Real Estate Bangladesh', 'নবধারা আরিয়ান সোসাইটি'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
