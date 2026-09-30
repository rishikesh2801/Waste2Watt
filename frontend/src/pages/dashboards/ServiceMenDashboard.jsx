import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User, Activity, PlusCircle, AlertCircle, CheckSquare, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ProfileView from '../../components/ProfileView';
import IoTDashboardView from './IoTDashboardView';
import AssignTaskView from '../../components/AssignTaskView';
import ComplaintsView from './ComplaintsView';
import VerifyTasksView from './VerifyTasksView';
import EmployeeListView from './EmployeeListView';

const ServiceMenDashboard = () => {
  const navItems = [
    { label: 'Profile', path: '/service-men/profile', icon: User },
    { label: 'IoT Monitoring', path: '/service-men/iot', icon: Activity },
    { label: 'Assign Task', path: '/service-men/assign', icon: PlusCircle },
    { label: 'Complaints', path: '/service-men/complaints', icon: AlertCircle },
    { label: 'Verify Tasks', path: '/service-men/verify', icon: CheckSquare },
    { label: 'Employee List', path: '/service-men/employees', icon: Users },
  ];

  return (
    <DashboardLayout title="Service Men Dashboard" navItems={navItems}>
      <Routes>
        <Route path="profile" element={<ProfileView />} />
        <Route path="iot" element={<IoTDashboardView />} />
        <Route path="assign" element={<AssignTaskView userRole="service-man" />} />
        <Route path="complaints" element={<ComplaintsView />} />
        <Route path="verify" element={<VerifyTasksView />} />
        <Route path="employees" element={<EmployeeListView />} />
        <Route path="*" element={<Navigate to="iot" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ServiceMenDashboard;
