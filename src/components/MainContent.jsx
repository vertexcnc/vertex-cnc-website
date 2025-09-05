import React from 'react';

// Section Components
import HeroSection from './sections/HeroSection';
import StatsSection from './sections/StatsSection';
import ServicesSection from './sections/ServicesSection';
import ProcessSection from './sections/ProcessSection';
import QuotePanel from './sections/QuotePanel';
import TrackingPanel from './sections/TrackingPanel';
import DetailedTrackingPanel from './sections/DetailedTrackingPanel';

const MainContent = () => {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <ProcessSection />
      <QuotePanel />
      <TrackingPanel />
      <DetailedTrackingPanel />
    </main>
  );
};

export default MainContent;
