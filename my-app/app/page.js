'use client';

import PageLayout from "./components/PageLayout";
import SaveRoute from "./components/SaveRoute";
import SavedRoutesList from "./components/SavedRoutesList";
import Navbar from "./components/Navbar/Navbar";
import LandingPage from "./components/LandingPage/LandingPage.jsx";

export default function Home() {
  return (
    <PageLayout>
      <Navbar />
      <LandingPage />
    </PageLayout>
  );
}

