import React, { useState } from 'react';
import { Mail, MapPin, CheckCircle, Clock, Trash2, Copy, List, Grid } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ComplaintsView = () => {
  const { complaints, setComplaints, resolveComplaint, deleteComplaint, bulkDeleteComplaints, staffList, addTask } = useAppContext();
  const [simulatingEmail, setSimulatingEmail] = useState(null);
  const [timeInputs, setTimeInputs] = useState({});
  const [roleInputs, setRoleInputs] = useState({});
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');

  const handleMarkSeen = async (id) => {
    try {
      await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSeen: true })
      });
      setComplaints(p => p.map(c => c.id === id ? { ...c, isSeen: true } : c));
    } catch (err) {
      console.error(err);
    }
  };
 
  const handleQuickAssign = async (complaint) => {
    const time = timeInputs[complaint.id];
    const role = roleInputs[complaint.id] || 'Waste Collector';
    
    if (!time) return alert("Please enter estimated time in minutes.");
    
    const worker = staffList.find(s => s.role === role && s.status === 'Available');
    if (!worker) return alert(`No available ${role}s at the moment.`);
 
    addTask({
      desc: complaint.description || complaint.desc,
      location: complaint.location,
      timeAllotted: parseInt(time),
      status: 'assigned',
      assignedTo: worker.id,
      assignedToName: worker.name,
      assignedBy: 'Service Man',
      linkedComplaintId: complaint.id
    });
 
    try {
      await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAssigned: true })
      });
      setComplaints(p => p.map(c => c.id === complaint.id ? { ...c, isAssigned: true } : c));
      alert(`Task quickly assigned to ${worker.name} (${role}) for ${time} minutes.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = (id) => {
    setSimulatingEmail(id);
    setTimeout(() => {
      resolveComplaint(id);
      setSimulatingEmail(null);
    }, 2000);
  };

  const toggleSelect = (id) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const displayedComplaints = complaints.filter(c => c.status === activeTab);

  const renderCard = (complaint) => (
      <div key={complaint.id} className="card-3d flex flex-col pt-5">
        <div className="px-5 mb-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-wider">
                  {complaint.id}
                </span>
                <button 
                  onClick={() => {
                      navigator.clipboard.writeText(complaint.id);
                      alert('Tracking ID Copied!');
                  }}
                  className="text-slate-400 hover:text-municipal-blue transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {complaint.status}
            </span>
          </div>
          <h4 className="font-bold text-lg text-slate-800 mb-1">{complaint.name}</h4>
            <p className="text-sm flex items-center gap-1 text-municipal-blue mb-3 font-medium">
            <Mail className="w-3 h-3" /> {complaint.email}
          </p>
          <p className="text-sm text-slate-600 mb-4 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{complaint.description || complaint.desc}"
          </p>
          
          <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {complaint.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : complaint.date}</span>
          </div>
        </div>

        {complaint.photoUrl && (
            <div className="px-5 pb-4">
              <div className="text-xs font-bold text-slate-500 mb-1">Attached Photo:</div>
              <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <img src={complaint.photoUrl} alt="Issue" className="w-full h-full object-cover" />
              </div>
            </div>
        )}

        <div className="border-t border-slate-100 p-3 bg-slate-50/50 mt-auto rounded-b-2xl">
          {complaint.status === 'Pending' ? (
            <div className="flex flex-col gap-2">
              {complaint.isAssigned ? (
                <button 
                  onClick={() => handleResolve(complaint.id)}
                  disabled={simulatingEmail === complaint.id}
                  className="w-full btn-primary bg-green-500 hover:bg-green-600 py-2.5 flex justify-center items-center gap-2"
                >
                  {simulatingEmail === complaint.id ? 'Sending Email...' : <><CheckCircle className="w-4 h-4" /> Finalize & Resolve</>}
                </button>
              ) : complaint.isSeen ? (
                <>
                  <div className="flex flex-col gap-2 mb-1">
                    <select 
                      className="input-3d py-1.5 px-3 text-sm font-semibold text-slate-700 bg-white"
                      value={roleInputs[complaint.id] || 'Waste Collector'}
                      onChange={e => setRoleInputs({...roleInputs, [complaint.id]: e.target.value})}
                    >
                      <option value="Waste Collector">Assign to Waste Collector</option>
                      <option value="Vehicle Manager">Assign to Vehicle Manager</option>
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Mins needed" 
                        className="input-3d flex-1 py-1.5 px-3 text-sm min-w-0" 
                        value={timeInputs[complaint.id] || ''} 
                        onChange={e => setTimeInputs({...timeInputs, [complaint.id]: e.target.value})} 
                      />
                      <button className="btn-primary py-1.5 px-3 text-sm shrink-0" onClick={() => handleQuickAssign(complaint)}>Quick Assign</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(complaint.id)}
                    disabled={simulatingEmail === complaint.id}
                    className="w-full btn-outline border-green-500 text-green-600 hover:bg-green-50 py-1.5 flex justify-center items-center text-xs font-bold transition-colors"
                  >
                      Or Resolve Directly
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleMarkSeen(complaint.id)}
                  className="w-full btn-outline border-municipal-blue text-municipal-blue hover:bg-municipal-blue hover:text-white py-2 flex items-center justify-center gap-2 transition-all"
                >
                  Mark as Seen
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="w-full text-center py-2.5 text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> Resolved & Notified
              </div>
              <button 
                onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete this complaint?")) {
                        deleteComplaint(complaint.id);
                    }
                }}
                className="w-full btn-outline border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600 py-1.5 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Complaint
              </button>
            </div>
          )}
        </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <div 
          onClick={() => setActiveTab('Pending')}
          className={`card-3d cursor-pointer flex-1 p-4 flex items-center justify-between border-l-4 border-amber-500 transition-all ${activeTab === 'Pending' ? 'bg-amber-50 shadow-md ring-2 ring-amber-500/20' : 'bg-white hover:bg-amber-50/50'}`}
        >
          <div>
            <p className={`text-sm font-semibold ${activeTab === 'Pending' ? 'text-amber-700' : 'text-slate-500'}`}>Pending Complaints</p>
            <h3 className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'Pending').length}</h3>
          </div>
          <Clock className={`w-8 h-8 opacity-50 ${activeTab === 'Pending' ? 'text-amber-600' : 'text-amber-500'}`} />
        </div>
        
        <div 
          onClick={() => { setActiveTab('Resolved'); setSelectedIds([]); }}
          className={`card-3d cursor-pointer flex-1 p-4 flex items-center justify-between border-l-4 border-green-500 transition-all ${activeTab === 'Resolved' ? 'bg-green-50 shadow-md ring-2 ring-green-500/20' : 'bg-white hover:bg-green-50/50'}`}
        >
          <div>
            <p className={`text-sm font-semibold ${activeTab === 'Resolved' ? 'text-green-700' : 'text-slate-500'}`}>Resolved Complaints</p>
            <h3 className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'Resolved').length}</h3>
          </div>
          <CheckCircle className={`w-8 h-8 opacity-50 ${activeTab === 'Resolved' ? 'text-green-600' : 'text-green-500'}`} />
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-municipal-blue text-white' : 'text-slate-400 hover:bg-slate-100'}`}
            >
               <Grid className="w-5 h-5"/>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-municipal-blue text-white' : 'text-slate-400 hover:bg-slate-100'}`}
            >
               <List className="w-5 h-5"/>
            </button>
         </div>
         {activeTab === 'Resolved' && viewMode === 'list' && selectedIds.length > 0 && (
             <button
               onClick={() => {
                   if (window.confirm(`Permanently delete ${selectedIds.length} complaints?`)) {
                       bulkDeleteComplaints(selectedIds);
                       setSelectedIds([]);
                   }
               }}
               className="btn-primary bg-rose-500 hover:bg-rose-600 border-none py-2 flex items-center justify-center gap-2 px-4 shadow-rose-500/30 shadow-lg text-sm"
             >
                 <Trash2 className="w-4 h-4"/> Delete Selected ({selectedIds.length})
             </button>
         )}
      </div>

      {displayedComplaints.length === 0 && (
          <div className="w-full card-3d p-8 text-center text-slate-500 font-medium mt-6">
            No {activeTab.toLowerCase()} complaints found.
          </div>
      )}

      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedComplaints.map(complaint => renderCard(complaint))}
          </div>
      ) : (
          <div className="flex flex-col gap-3">
             {activeTab === 'Resolved' && displayedComplaints.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 accent-municipal-blue cursor-pointer"
                     checked={selectedIds.length === displayedComplaints.length && displayedComplaints.length > 0}
                     onChange={(e) => {
                         if (e.target.checked) setSelectedIds(displayedComplaints.map(c => c.id));
                         else setSelectedIds([]);
                     }}
                   />
                   <span className="w-24">ID</span>
                   <span className="flex-1">Details</span>
                   <span className="w-32 text-right">Date</span>
                </div>
             )}
             
             {displayedComplaints.map(complaint => (
                <div key={complaint.id} className={`card-3d p-4 flex items-center gap-4 transition-all ${selectedIds.includes(complaint.id) ? 'border-municipal-blue bg-blue-50/50' : 'bg-white hover:border-slate-300'}`}>
                   {activeTab === 'Resolved' && (
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 accent-municipal-blue cursor-pointer"
                         checked={selectedIds.includes(complaint.id)}
                         onChange={() => toggleSelect(complaint.id)}
                       />
                   )}
                   <div className="w-24 shrink-0 font-mono text-sm font-bold text-municipal-blue flex items-center gap-1">
                       {complaint.id.length > 10 ? complaint.id.substring(0,8)+'...' : complaint.id}
                       <Copy 
                         className="w-3 h-3 text-slate-400 cursor-pointer hover:text-municipal-blue" 
                         onClick={() => {
                             navigator.clipboard.writeText(complaint.id);
                             alert('Tracking ID Copied!');
                         }} 
                       />
                   </div>
                   <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-slate-800 text-sm truncate">{complaint.name} • {complaint.location}</h4>
                       <p className="text-xs text-slate-500 truncate mt-1">{complaint.description || complaint.desc}</p>
                   </div>
                   <div className="w-32 shrink-0 text-right">
                       <p className="text-[10px] font-bold text-slate-400">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</p>
                       <p className="text-[10px] text-slate-400">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleTimeString() : complaint.date}</p>
                   </div>
                   {activeTab === 'Pending' && (
                       <button onClick={() => setViewMode('grid')} className="text-xs font-bold text-municipal-blue hover:underline pl-4 border-l border-slate-200">
                           Manage
                       </button>
                   )}
                </div>
             ))}
          </div>
      )}
    </div>
  );
};

export default ComplaintsView;
