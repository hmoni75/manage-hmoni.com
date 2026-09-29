import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'Nobodhara Aryan Society',
    description: 'Official Dashboard for Nobodhara Aryan Society',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'Nobodhara Aryan Society',
        url: 'https://nobodhara-aryan-society.org/',
        description: 'Official Dashboard for Nobodhara Aryan Society',
        images: ['/logo.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo.png'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
