import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'HMoni Admin Portal',
    description: 'Official Dashboard for HMoni Admin Portal',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'HMoni Admin Portal',
        url: 'https://manage-hmoni.com/',
        description: 'Official Dashboard for HMoni Admin Portal',
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
