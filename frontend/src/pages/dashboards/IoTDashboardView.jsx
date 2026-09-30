import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Battery, Wifi, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const IoTDashboardView = () => {
  const [dustbins, setDustbins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback Mock Data matching the 4 physical dustbins on the Arduino
  const mockDustbins = [
    { dustbinId: 'IOT-BN-01', location: 'Sector 4, Main Market', fillLevel: 10, batteryStatus: 98, signalStrength: 'Strong', status: 'Empty' },
    { dustbinId: 'IOT-BN-02', location: 'Station Road, Lane 2', fillLevel: 10, batteryStatus: 95, signalStrength: 'Strong', status: 'Empty' },
    { dustbinId: 'IOT-BN-03', location: 'Civil Lines, Park Avenue', fillLevel: 10, batteryStatus: 90, signalStrength: 'Strong', status: 'Empty' },
    { dustbinId: 'IOT-BN-04', location: 'IIT Roorkee Main Gate', fillLevel: 10, batteryStatus: 99, signalStrength: 'Strong', status: 'Empty' }
  ];

  const [prevFullBins, setPrevFullBins] = useState([]);
  const { addTask, tasks, staffList, setStaffList } = useAppContext(); // Retrieve tasks context
  
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, bin: null });
  const [selectedRole, setSelectedRole] = useState('');
  const [timeAllotted, setTimeAllotted] = useState('30');

  const fetchIoTData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const response = await fetch('/api/iot');
      if (response.ok) {
        const dbData = await response.json();
        
        // Merge real live database data over the fallback mock data
        const mergedBins = mockDustbins.map(mockBin => {
           const liveBin = dbData.find(d => d.dustbinId === mockBin.dustbinId);
           return liveBin ? liveBin : mockBin;
        });
        
        // Play continuous audio alert for full dustbins until they are dispatched
        const undispatchedFullBins = mergedBins.filter(b => 
            b.fillLevel >= 90 && 
            // Check if there is NO active task assigned for this specific bin
            !tasks.some(t => t.linkedIoTId === b.dustbinId && ['active', 'assigned'].includes(t.status.toLowerCase()))
        );

        // Only speak if it's not already speaking to avoid overlapping echoes
        if (!window.speechSynthesis.speaking && undispatchedFullBins.length > 0) {
            undispatchedFullBins.forEach(bin => {
               const binNumber = bin.dustbinId.split('-').pop();
               const msg = new SpeechSynthesisUtterance(`Savadhaan! Dustbin number ${binNumber}, jo ki ${bin.location} par hai, full ho chuka hai. Kripya dhyan dein.`);
               msg.lang = 'hi-IN'; // Hindi voice
               msg.rate = 0.9;
               window.speechSynthesis.speak(msg);
            });
        }
        
        setDustbins(mergedBins);
      } else {
        setDustbins(mockDustbins);
      }
    } catch (err) {
      console.error("Failed to fetch IoT data:", err);
      setDustbins(mockDustbins);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const openDispatchModal = (bin) => {
      setDispatchModal({ isOpen: true, bin });
      setSelectedRole('');
      setTimeAllotted('30');
  };

  const confirmDispatch = () => {
      if (!selectedRole || !timeAllotted) return alert("Please select a required role and time.");
      
      const availableStaff = staffList.filter(s => s.status === 'Available' && s.role === selectedRole);
      
      if (availableStaff.length === 0) {
          return alert(`No ${selectedRole} is currently available! Please wait or select another role.`);
      }

      // Automatically assign to a random available staff member in that role
      const randomStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];
      
      // Create a task dynamically
      addTask({
          desc: `[URGENT IOT ALERT] Clean ${dispatchModal.bin.dustbinId} which is currently FULL.`,
          location: dispatchModal.bin.location,
          assignedTo: randomStaff.id,
          assignedToName: randomStaff.name,
          assignedBy: 'System',
          timeAllotted: parseInt(timeAllotted),
          linkedIoTId: dispatchModal.bin.dustbinId
      });
      
      // Mark staff as busy
      setStaffList(prev => prev.map(s => s.id === randomStaff.id ? { ...s, status: 'Busy' } : s));
      
      alert(`System Auto-Assigned! Task has been given to ${randomStaff.name} (${randomStaff.id}) (${selectedRole}). They are now Busy.`);
      setDispatchModal({ isOpen: false, bin: null });
  };

  useEffect(() => {
    fetchIoTData();
    // Auto refresh every 5 seconds for live telemetry
    const interval = setInterval(() => {
      fetchIoTData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (fillLevel) => {
    if (fillLevel >= 90) return 'text-red-600 bg-red-100 border-red-200';
    if (fillLevel >= 75) return 'text-amber-600 bg-amber-100 border-amber-200';
    if (fillLevel > 20) return 'text-blue-600 bg-blue-100 border-blue-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const getProgressColor = (fillLevel) => {
    if (fillLevel >= 90) return 'bg-red-500';
    if (fillLevel >= 75) return 'bg-amber-500';
    if (fillLevel > 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Smart Waste IoT Telemetry</h2>
           <p className="text-slate-500 text-sm">Live feeds from ultra-sonic smart dustbins deployed across Roorkee.</p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => fetchIoTData()}
             disabled={isRefreshing}
             className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 font-semibold text-xs border rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
           >
             <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
             Refresh Feed
           </button>

           <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border px-3 py-2 rounded-xl shadow-sm">
             <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
             {dustbins.filter(d => d.fillLevel >= 90).length} Critical Bin(s)
           </div>
        </div>
      </div>

      {loading ? (
         <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-municipal-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold text-sm">Querying IoT Nodes...</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {dustbins.map(bin => (
             <div key={bin.dustbinId} className="card-3d hover:-translate-y-1 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="font-bold text-lg text-slate-800">{bin.dustbinId}</h4>
                   <p className="text-xs text-slate-500 font-medium">{bin.location}</p>
                 </div>
                 <div className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(bin.fillLevel)}`}>
                   {(bin.status || 'NORMAL').toUpperCase()}
                 </div>
               </div>

               <div className="flex items-end justify-center py-6 mb-2 relative">
                  <div className="absolute top-0 right-0 space-y-2">
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold" title="Battery Status">
                      <Battery className={`w-4 h-4 ${(bin.batteryStatus || bin.battery) < 50 ? 'text-amber-500' : 'text-green-500'}`} /> {bin.batteryStatus || bin.battery}%
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold" title="Signal Strength">
                      <Wifi className={`w-4 h-4 ${(bin.signalStrength || bin.signal) === 'Weak' ? 'text-amber-500' : 'text-blue-500'}`} /> {bin.signalStrength || bin.signal}
                    </div>
                  </div>
                  
                  {/* 3D Dustbin visualization */}
                  <div className="relative w-24 h-32 flex flex-col items-center">
                     <div className="w-24 h-4 bg-slate-200 rounded-[50%] absolute -top-2 z-10 border border-slate-300" style={{ transform: 'rotateX(60deg)' }}></div>
                     <div className="w-24 h-full bg-slate-100 rounded-b-xl border-x border-b border-slate-300 relative overflow-hidden flex items-end">
                        <div 
                          className={`w-full transition-all duration-500 ease-in-out ${getProgressColor(bin.fillLevel)} opacity-80`} 
                          style={{ height: `${bin.fillLevel}%` }}
                        />
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 mix-blend-overlay text-xl z-20">
                        {bin.fillLevel}%
                     </div>
                  </div>
               </div>

               <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(bin.fillLevel)}`}
                    style={{ width: `${bin.fillLevel}%` }}
                  />
               </div>
               
               <div className="mt-4 flex justify-end">
                 {bin.fillLevel >= 90 && (() => {
                   // Check if a task is already dispatched for this bin
                   const activeTask = tasks.find(t =>
                     t.linkedIoTId === bin.dustbinId &&
                     ['active', 'assigned', 'pending verification'].includes((t.status || '').toLowerCase())
                   );
                   if (activeTask) {
                     return (
                       <div className="flex flex-col items-end gap-1">
                         <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                           ✅ Dispatched — {activeTask.assignedToName || 'Staff'}
                         </span>
                         <span className="text-[10px] text-slate-400 font-medium">Status: {activeTask.status?.toUpperCase()}</span>
                       </div>
                     );
                   }
                   return (
                     <button
                       onClick={() => openDispatchModal(bin)}
                       className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors animate-pulse"
                     >
                       <AlertTriangle className="w-4 h-4" /> Dispatch Collector
                     </button>
                   );
                 })()}
               </div>
             </div>
           ))}
         </div>
      )}

      {/* Quick Dispatch Modal */}
      {dispatchModal.isOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="card-3d bg-white max-w-md w-full p-6 relative">
              <h3 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">Assign IoT Cleaning Task</h3>
              <p className="text-sm font-semibold text-slate-600 mb-4">
                 Target: <span className="text-red-600">{dispatchModal.bin?.dustbinId}</span> at {dispatchModal.bin?.location}
              </p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Required Role</label>
                    <select 
                       className="w-full border border-slate-300 rounded-lg p-2 focus:border-municipal-blue focus:ring-1 focus:ring-municipal-blue outline-none"
                       value={selectedRole}
                       onChange={(e) => setSelectedRole(e.target.value)}
                    >
                       <option value="">-- Choose a Role --</option>
                       <option value="Waste Collector">Waste Collector</option>
                       <option value="Vehicle Manager">Vehicle Manager</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">System will auto-assign to a random available person in this role.</p>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Allotted (Minutes)</label>
                    <input 
                       type="number"
                       className="w-full border border-slate-300 rounded-lg p-2 focus:border-municipal-blue focus:ring-1 focus:ring-municipal-blue outline-none"
                       value={timeAllotted}
                       onChange={(e) => setTimeAllotted(e.target.value)}
                       min="1"
                    />
                 </div>
              </div>

              <div className="flex gap-2 mt-6">
                 <button 
                    onClick={() => setDispatchModal({ isOpen: false, bin: null })}
                    className="flex-1 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={confirmDispatch}
                    className="flex-1 py-2 rounded-lg font-bold text-white bg-municipal-blue hover:bg-blue-700 transition-colors"
                 >
                    Confirm Assign
                 </button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default IoTDashboardView;
