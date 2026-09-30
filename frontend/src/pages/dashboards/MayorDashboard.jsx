import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User, IndianRupee, PlusCircle, UserPlus, MapPin, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileView from '../../components/ProfileView';
import MayorFundsView from './MayorFundsView';
import AssignTaskView from '../../components/AssignTaskView';
import AddEmployeeView from '../../components/AddEmployeeView';
import MayorMapView from './MayorMapView';
import MayorEmployeeList from './MayorEmployeeList';

const MayorDashboard = () => {
  const navItems = [
    { label: 'Profile', path: '/mayor/profile', icon: User },
    { label: 'Funds', path: '/mayor/funds', icon: IndianRupee },
    { label: 'City Map', path: '/mayor/map', icon: MapPin },
    { label: 'Employees', path: '/mayor/employees', icon: Users },
    { label: 'Assign Task', path: '/mayor/assign', icon: PlusCircle },
    { label: 'Add Employee', path: '/mayor/add-staff', icon: UserPlus },
  ];

  return (
    <DashboardLayout title="Mayor Dashboard" navItems={navItems}>
      <Routes>
        <Route path="profile" element={<ProfileView />} />
        <Route path="funds" element={<MayorFundsView />} />
        <Route path="map" element={<MayorMapView />} />
        <Route path="employees" element={<MayorEmployeeList />} />
        <Route path="assign" element={<AssignTaskView userRole="mayor" />} />
        <Route path="add-staff" element={<AddEmployeeView />} />
        <Route path="*" element={<Navigate to="funds" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default MayorDashboard;
