import React from 'react';
import { getPlots } from '@/lib/db';
import PlotsClient from './PlotsClient';

export const revalidate = 0; // Fetch latest cPanel MySQL records

export default async function PlotsPage() {
  const { plots, isConnectedToDb } = await getPlots();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PlotsClient initialPlots={plots} isConnectedToDb={isConnectedToDb} />
    </div>
  );
}
