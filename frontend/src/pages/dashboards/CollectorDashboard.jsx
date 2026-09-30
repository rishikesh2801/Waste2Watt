import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileView from '../../components/ProfileView';
import WorkerDashboardView from '../../components/WorkerDashboardView';

const CollectorDashboard = () => {
  const navItems = [
    { label: 'Profile', path: '/collector/profile', icon: User },
    { label: 'Dashboard', path: '/collector/dashboard', icon: LayoutDashboard },
  ];

  return (
    <DashboardLayout title="Waste Collector Dashboard" navItems={navItems}>
      <Routes>
        <Route path="profile" element={<ProfileView />} />
        <Route path="dashboard" element={<WorkerDashboardView />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default CollectorDashboard;
