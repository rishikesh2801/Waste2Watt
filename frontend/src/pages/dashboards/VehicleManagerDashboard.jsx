import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileView from '../../components/ProfileView';
import WorkerDashboardView from '../../components/WorkerDashboardView';

const VehicleManagerDashboard = () => {
  const navItems = [
    { label: 'Profile', path: '/vehicle-manager/profile', icon: User },
    { label: 'Dashboard', path: '/vehicle-manager/dashboard', icon: LayoutDashboard },
  ];

  return (
    <DashboardLayout title="Vehicle Manager Dashboard" navItems={navItems}>
      <Routes>
        <Route path="profile" element={<ProfileView isVehicleManager={true} />} />
        <Route path="dashboard" element={<WorkerDashboardView isVehicleManager={true} />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VehicleManagerDashboard;
