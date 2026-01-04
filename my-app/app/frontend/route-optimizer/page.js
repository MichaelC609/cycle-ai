'use client';

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Map from '@/app/components/Map';
import SaveRoute from '@/app/components/SaveRoute';
import Navbar from '@/app/components/Navbar/Navbar';

export default function RouteOptimizer() {

  return (
    <PageLayout>
      <Navbar />
      <Map />
      <SaveRoute />
    </PageLayout>
  );
}
