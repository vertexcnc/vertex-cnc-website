import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Main Content Components
import MainContent from './components/MainContent';
import AdminPanel from './components/admin/AdminPanel';

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
          <h1 className="text-3xl font-bold mb-8 text-center">Sipariş Takibi</h1>
          {/* TrackingDetails bileşeni buraya gelecek */}
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
