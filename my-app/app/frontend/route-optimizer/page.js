'use client';

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Map from '@/app/components/Map';
import SaveRoute from '@/app/components/SaveRoute';

export default function RouteOptimizer() {

  return (
    <PageLayout>
      <Map />
      <SaveRoute />
    </PageLayout>
  );
}
