import React, { useState } from 'react';
import { Search, UserPlus, FileText, CheckCircle, MapPin, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import RoorkeeLocationInput from './RoorkeeLocationInput';
import TextCaptcha from './TextCaptcha';

const AssignTaskView = ({ userRole }) => {
  const { addTask, user, staffList } = useAppContext();
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskTimeMinutes, setTaskTimeMinutes] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignCategory, setAssignCategory] = useState('Waste Collector');
  const [linkedComplaintId, setLinkedComplaintId] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const filteredStaff = staffList.filter(
    s => s.role === assignCategory &&
         s.status === 'Available' &&
         s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!selectedUser || !taskDesc) return;
    
    if(!taskLocation.toLowerCase().includes('roorkee')) {
      return alert("Invalid Area: Tasks can only be assigned to locations within Roorkee. Please select a valid Roorkee location.");
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const assignee = staffList.find(s => s.id === selectedUser);
      addTask({
        desc: taskDesc,
        location: taskLocation || 'Roorkee City',
        timeAllotted: taskTimeMinutes, // storing number of minutes
        status: 'assigned',
        assignedTo: selectedUser,
        assignedToName: assignee?.name,
        assignedBy: user?.role === 'mayor' ? 'Mayor' : 'Service Man',
        linkedComplaintId: linkedComplaintId || null // link to a complaint if provided
      });
      setIsSubmitting(false);
      setSuccess(true);
      setTaskDesc('');
      setTaskLocation('');
      setTaskTimeMinutes(30);
      setLinkedComplaintId('');
      setSelectedUser(null);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="card-3d bg-white/80 backdrop-blur-sm max-w-4xl">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-municipal-dark">Assign New Task</h3>
        <p className="text-sm text-slate-500 mt-1">Assign duties to collectors or vehicle managers</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 flex items-center gap-3 border border-green-200 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-semibold">Task successfully assigned!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Task Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-municipal-blue" />
            Task Description
          </label>
          <textarea 
            required
            rows={3} 
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            placeholder="E.g., Clear bins at Sector 4 market and transport to main depot." 
            className="input-3d resize-none bg-white"
          ></textarea>
        </div>

        {/* Link Complaint (Optional) */}
        <div className="space-y-2">
           <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
             <FileText className="w-4 h-4 text-municipal-blue" />
             Link to a Pending Complaint (Optional)
           </label>
           <div className="flex -mt-1">
              <select 
                 value={linkedComplaintId} 
                 onChange={(e) => setLinkedComplaintId(e.target.value)}
                 className="input-3d bg-white w-full appearance-none"
              >
                  <option value="">-- No linked complaint --</option>
                  {/* Normally we'd grab complaints from AppContext, but we don't have it explicitly mapped in this component yet... wait, let's just make it a text field for simplification, or we DO have useAppContext. */}
                  {/* Let's grab context again in this component if needed. Wait, we don't have `complaints` destructured in `AssignTaskView`. I'll add a simple input field for the ID to be safe, or just skip full dropdown. Let's make it a text field. */}
                  <option disabled>Type below if needed</option>
              </select>
           </div>
           <input 
              type="text"
              value={linkedComplaintId}
              onChange={(e) => setLinkedComplaintId(e.target.value)}
              placeholder="Enter Complaint ID to link (e.g., C-123456)"
              className="input-3d bg-white w-full mt-2"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-municipal-blue" />
              Task Location / Area (Roorkee Only)
            </label>
            <RoorkeeLocationInput 
              value={taskLocation}
              onChange={setTaskLocation}
              placeholder="Start typing area (e.g. Civil Lines)"
            />
          </div>

          {/* Allotted Time (Minutes) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-municipal-blue" />
              Time Allotted (Minutes)
            </label>
            <input 
              required
              type="number"
              min="1"
              value={taskTimeMinutes}
              onChange={(e) => setTaskTimeMinutes(e.target.value)}
              className="input-3d bg-white"
              placeholder="e.g., 45"
            />
          </div>
        </div>

        {/* Staff Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-municipal-blue" />
            Select Assignee Category
          </label>
          
          <div className="flex gap-3 mb-2">
            <button
              type="button"
              onClick={() => { setAssignCategory('Waste Collector'); setSelectedUser(null); }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${assignCategory === 'Waste Collector' ? 'bg-municipal-blue text-white shadow-md' : 'card-3d bg-white text-slate-500 hover:text-municipal-blue'}`}
            >
              Waste Collectors
            </button>
            <button
              type="button"
              onClick={() => { setAssignCategory('Vehicle Manager'); setSelectedUser(null); }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${assignCategory === 'Vehicle Manager' ? 'bg-municipal-blue text-white shadow-md' : 'card-3d bg-white text-slate-500 hover:text-municipal-blue'}`}
            >
              Vehicle Managers
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-3d pl-12 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
            {filteredStaff.length > 0 ? filteredStaff.map(staff => (
              <div 
                key={staff.id}
                onClick={() => setSelectedUser(staff.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedUser === staff.id 
                  ? 'border-municipal-blue bg-municipal-blue/5 shadow-inner-3d' 
                  : 'border-transparent card-3d shadow-sm hover:shadow-3d-card'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800">{staff.name}</h5>
                    <span className="text-xs font-semibold text-municipal-blue bg-municipal-blue/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {staff.role}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    staff.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {staff.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-500">
                No staff members found matching your search.
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 mt-4 flex flex-col md:flex-row justify-between items-end gap-4 shadow-inner-3d p-4 rounded-xl">
          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-400 ml-1 leading-tight">Human Verification Required <br/><span className="text-[10px] font-medium">(Type the characters shown)</span></label>
             <TextCaptcha onVerify={setCaptchaVerified} />
          </div>
          <button 
            type="submit" 
            disabled={!selectedUser || !taskDesc || !taskLocation || isSubmitting || !captchaVerified}
            className={`btn-primary w-full md:w-auto px-8 ${(!selectedUser || !taskDesc || !taskLocation || !captchaVerified) ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''}`}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskView;
