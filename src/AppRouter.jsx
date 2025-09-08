import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Main Content Components
import MainContent from './components/MainContent';
import AdminPanel from './components/admin/AdminPanel';
import TrackingDetails from './components/tracking/TrackingDetails';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <MainContent />
        <Footer />
      </>
    )
  },
  {
    path: "/admin",
    element: (
      <>
        <AdminPanel />
      </>
    )
  },
  {
    path: "/track/:trackingId",
    element: (
      <>
        <Header />
        <div className="container mx-auto py-8">
          <TrackingDetails />
        </div>
        <Footer />
      </>
    )
  }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
