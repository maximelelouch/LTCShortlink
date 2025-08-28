import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './Providers';
import { Toaster } from 'react-hot-toast'; // Importation

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shorty - Raccourcisseur d\'URL',
  description: 'Raccourcissez vos liens facilement et suivez leurs performances',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        {/* Placement du composant Toaster ici pour qu'il soit disponible partout */}
        <Toaster position="top-center" reverseOrder={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}