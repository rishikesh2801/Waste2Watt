import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle, Smartphone, Mail, Briefcase, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const EmployeeListView = () => {
  const { staffList, tasks } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Filter staff to include only Waste Collectors and Vehicle Managers as requested
  const filteredStaff = staffList.filter(s => {
    const isTargetRole = s.role === 'Waste Collector' || s.role === 'Vehicle Manager';
    if (!isTargetRole) return false;

    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = roleFilter === 'All' || s.role === roleFilter;

    return matchesSearch && matchesFilter;
  });

  // Get active task details for a busy staff member
  const getActiveTask = (staffId) => {
    return tasks.find(t => 
      (t.assignedToId === staffId || t.assignedTo === staffId) && 
      ['assigned', 'active'].includes(t.status.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Field Employee Registry</h2>
          <p className="text-slate-500 text-sm">Monitor live status, roles, and current assignments of all field personnel.</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-municipal-blue/50"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-400" />
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-municipal-blue/50 appearance-none cursor-pointer font-medium text-slate-700"
            >
              <option value="All">All Roles</option>
              <option value="Waste Collector">Waste Collectors</option>
              <option value="Vehicle Manager">Vehicle Managers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredStaff.length === 0 ? (
        <div className="card-3d text-center py-12 text-slate-500">
          <p className="font-bold text-lg">No Employees Found</p>
          <p className="text-sm mt-1">Try adjusting your search query or filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(s => {
            const activeTask = getActiveTask(s.id);
            const isBusy = s.status === 'Busy';
            
            return (
              <div 
                key={s.id} 
                className={`card-3d border-t-4 transition-all duration-300 ${
                  isBusy 
                    ? 'border-t-amber-500 hover:shadow-amber-500/10' 
                    : 'border-t-green-500 hover:shadow-green-500/10'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.id}</span>
                    <h3 className="font-bold text-lg text-slate-800 mt-0.5">{s.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-municipal-blue" />
                      {s.role}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isBusy 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {isBusy ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Busy
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </>
                    )}
                  </span>
                </div>

                {/* Profile Details */}
                <div className="space-y-2 text-sm text-slate-600 font-medium border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span>{s.mobile || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{s.email || 'N/A'}</span>
                  </div>
                  
                  {s.role === 'Vehicle Manager' && s.assignedVehicle && (
                    <div className="bg-slate-50 rounded-xl p-2.5 mt-2 border border-slate-100 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Fleet</p>
                      <p className="font-bold text-slate-700 mt-0.5">{s.assignedVehicle} ({s.vehicleNumber || 'UK 08 AB' })</p>
                    </div>
                  )}
                </div>

                {/* Active Assignment Section */}
                {isBusy && activeTask ? (
                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mt-4 text-xs">
                    <p className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      Current Job Assignment
                    </p>
                    <p className="text-slate-700 font-semibold mt-1.5 line-clamp-2">
                      {activeTask.description || activeTask.desc}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-2 pt-2 border-t border-amber-100">
                      <span>📍 {activeTask.location}</span>
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Allotted: {activeTask.timeAllotted}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 mt-4 text-xs text-center text-green-700 font-semibold">
                    ⚡ Available for new tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeListView;
