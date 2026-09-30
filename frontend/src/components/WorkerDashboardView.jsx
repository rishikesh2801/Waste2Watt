import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Camera, CheckCircle, Clock, MapPin, Upload, X, AlertTriangle, Navigation, Truck, Activity, Star, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from './WebcamCapture';

// ── Live countdown timer ─────────────────────────────────────────────────────
const LiveTimer = ({ startTime, allottedMinutes }) => {
  const parsedStartTime = new Date(startTime).getTime();
  const [elapsed, setElapsed] = useState(Date.now() - parsedStartTime);

  React.useEffect(() => {
    const iv = setInterval(() => setElapsed(Date.now() - parsedStartTime), 1000);
    return () => clearInterval(iv);
  }, [parsedStartTime]);

  const totalAllowedMs = allottedMinutes * 60 * 1000;
  const remainingMs    = totalAllowedMs - elapsed;
  const isLate         = remainingMs < 0;
  const abMs           = Math.abs(remainingMs);
  const mins           = Math.floor(abMs / 60000);
  const secs           = Math.floor((abMs % 60000) / 1000);

  return isLate ? (
    <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs">
      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> LATE {mins}m {secs}s
    </span>
  ) : (
    <span className="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs">
      <Clock className="w-3.5 h-3.5" /> {mins}m {secs}s LEFT
    </span>
  );
};

// ── Main Worker Dashboard ────────────────────────────────────────────────────
const WorkerDashboardView = ({ isVehicleManager }) => {
  const { tasks, user, setStaffList, startTask, completeTask, complaints } = useAppContext();

  const [activeTab, setActiveTab]       = useState('active');
  const [selectedTask, setSelectedTask] = useState(null);
  const [photo, setPhoto]               = useState(null);
  const [notes, setNotes]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebcam, setShowWebcam]     = useState(false);
  const [mapLocation, setMapLocation]   = useState(null);
  const [showSteps, setShowSteps]       = useState(false);

  const userTasks      = tasks.filter(t => (t.assignedToId || t.assignedTo) === user?.id);
  const activeTasks    = userTasks.filter(t => ['active','assigned'].includes(t.status.toLowerCase()));
  const completedTasks = userTasks.filter(t => ['completed','completed_late','pending verification'].includes(t.status.toLowerCase()));

  const chartData = [
    { name: 'Active',    value: activeTasks.length },
    { name: 'Completed', value: completedTasks.length },
  ];
  const COLORS = ['#f59e0b', '#16a34a'];

  const completedCount = completedTasks.length;
  const lateCount      = completedTasks.filter(t => t.status === 'completed_late').length;
  const onTimeCount    = completedCount - lateCount;

  const barData = [
    { name: 'On Time', value: onTimeCount,       fill: '#16a34a' },
    { name: 'Late',    value: lateCount,          fill: '#ef4444' },
    { name: 'Active',  value: activeTasks.length, fill: '#f59e0b' },
  ];

  const handlePhotoUpload = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhoto({ raw: file, preview: URL.createObjectURL(file) });
    }
  };

  const startTaskHandler = (task) => {
    startTask(task._id || task.id);
    setStaffList(p => p.map(s => s.id === user?.id ? { ...s, status: 'Busy' } : s));
  };

  const markComplete = async () => {
    const isIoT = selectedTask.linkedIoTId || (selectedTask.description?.includes('IOT ALERT'));
    if (!isIoT && !photo) return alert('Please upload or capture a photo proof to complete the task.');

    setIsSubmitting(true);
    try {
      let photoBlob = null;
      if (!isIoT) {
        if (photo?.raw) {
          // File from file-picker — use directly
          photoBlob = photo.raw;
        } else if (photo?.preview?.startsWith('data:')) {
          // dataUrl from webcam — convert to proper File
          const res  = await fetch(photo.preview);
          const blob = await res.blob();
          photoBlob  = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        }
      }

      if (isIoT) {
        const iotId = selectedTask.linkedIoTId ||
          (selectedTask.description?.match(/IOT-BN-\d+/) ? selectedTask.description.match(/IOT-BN-\d+/)[0] : null);
        if (iotId) {
          await fetch('/api/iot/update', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ dustbinId: iotId, location: selectedTask.location || 'Resolved', fillLevel: 10, batteryStatus: 99, signalStrength: 'Strong', forceUnlock: true }),
          });
        }
      }

      const success = await completeTask(selectedTask._id || selectedTask.id, photoBlob, notes);
      if (success) {
        setStaffList(p => p.map(s => s.id === user?.id ? { ...s, status: 'Available' } : s));
        setSelectedTask(null);
        setPhoto(null);
        setNotes('');
        setActiveTab('completed');
      }
    } catch (err) {
      console.error('Mark complete failed:', err);
      alert('Server Error: Could not complete the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── STATS ROW ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Activity,     label: 'Total Assigned', value: userTasks.length,     color: 'blue'   },
          { icon: CheckCircle,  label: 'Completed',      value: completedCount,        color: 'green'  },
          { icon: Clock,        label: 'Active Now',     value: activeTasks.length,    color: 'amber'  },
          { icon: Star,         label: 'On-Time Rate',   value: completedCount > 0 ? `${Math.round((onTimeCount / completedCount) * 100)}%` : 'N/A', color: 'purple' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4 ${
            color==='blue'?'border-blue-100':color==='green'?'border-green-100':color==='amber'?'border-amber-100':'border-purple-100'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              color==='blue'?'bg-blue-50':color==='green'?'bg-green-50':color==='amber'?'bg-amber-50':'bg-purple-50'
            }`}>
              <Icon className={`w-5 h-5 ${
                color==='blue'?'text-blue-600':color==='green'?'text-green-700':color==='amber'?'text-amber-600':'text-purple-600'
              }`} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{value}</div>
              <div className="text-xs text-gray-500 font-semibold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN SECTION ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task List — 2/3 width */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tabs */}
          <div className="flex gap-3">
            {[['active','Active Tasks', activeTasks.length,'amber'],['completed','Completed', completedTasks.length,'green']].map(([tab,label,count,color]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                  activeTab === tab
                    ? color==='amber' ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-green-600 border-green-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab===tab?'bg-white/25':'bg-gray-100'}`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Task Cards */}
          <div className="space-y-4">
            {(activeTab === 'active' ? activeTasks : completedTasks).length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">
                  {activeTab === 'active' ? 'No active tasks right now.' : 'No completed tasks yet.'}
                </p>
              </div>
            ) : (
              (activeTab === 'active' ? activeTasks : completedTasks).map(task => (
                <div key={task.id || task._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-bold text-gray-800 text-base leading-snug flex-1">{task.description || task.desc}</h4>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        ['active','assigned'].includes(task.status) ? 'bg-amber-100 text-amber-700' :
                        task.status==='completed_late' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>{task.status.replace('_',' ').toUpperCase()}</span>
                      {task.status === 'active' && task.startTime && task.timeAllotted && (
                        <LiveTimer startTime={task.startTime} allottedMinutes={task.timeAllotted} />
                      )}
                      {task.status === 'assigned' && task.timeAllotted && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          ⏱ {task.timeAllotted}m Target
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linked Complaint */}
                  {task.linkedComplaintId && (() => {
                    const lc = complaints.find(c => c.id === task.linkedComplaintId || c.trackingId === task.linkedComplaintId);
                    return lc ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 flex gap-3 items-start">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-700 mb-1">🔗 Linked Complaint — {lc.id}</p>
                          <p className="text-sm font-semibold text-gray-700">{lc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">📞 {lc.mobile} · ✉️ {lc.email}</p>
                        </div>
                        {lc.photoUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-blue-200 shrink-0">
                            <img src={lc.photoUrl} alt="Complaint" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 items-center mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{task.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{task.createdAt ? new Date(task.createdAt).toLocaleString() : task.date}</span>
                    <span>By: <span className="font-semibold text-gray-700">{task.assignedByRole || task.assignedBy}</span></span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {task.location && task.location !== 'Assigned Location' && (
                      <button onClick={() => setMapLocation(task.location)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                        <Navigation className="w-3.5 h-3.5" /> Directions
                      </button>
                    )}
                    {task.status === 'assigned' && (
                      <button onClick={() => startTaskHandler(task)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                        <Truck className="w-3.5 h-3.5" /> Start Task
                      </button>
                    )}
                    {task.status.toLowerCase() === 'active' && (
                      <button onClick={() => { setSelectedTask(task); setPhoto(null); setNotes(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">

          {/* Complete Task Panel */}
          {selectedTask && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
              <div className="bg-amber-500 px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-base">Complete Task</h3>
                  <p className="text-amber-100 text-xs mt-0.5 truncate max-w-[180px]">{selectedTask.description || selectedTask.desc}</p>
                </div>
                <button onClick={() => { setSelectedTask(null); setPhoto(null); setNotes(''); }}
                  className="p-1.5 bg-amber-600/50 hover:bg-amber-600 text-white rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Photo Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden">
                  {photo ? (
                    <>
                      <img src={photo.preview} alt="Proof" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                      <button onClick={() => setPhoto(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md z-10 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">✓ Photo Ready</div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4">
                      <p className="text-xs text-gray-500 font-semibold">Upload proof of completion</p>
                      <div className="flex gap-3">
                        <label htmlFor="task-upload"
                          className="flex flex-col items-center gap-1.5 cursor-pointer p-3 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 text-gray-500 hover:text-green-700 transition-all text-xs font-bold">
                          <Upload className="w-5 h-5" /> Upload
                        </label>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="task-upload" />
                        <button type="button" onClick={() => setShowWebcam(true)}
                          className="flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 text-gray-500 hover:text-green-700 transition-all text-xs font-bold">
                          <Camera className="w-5 h-5" /> Camera
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-green-600" /> Notes (optional)
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Any remarks about this task..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none" />
                </div>

                {showWebcam && (
                  <WebcamCapture
                    onCapture={(dataUrl) => { setPhoto({ preview: dataUrl }); setShowWebcam(false); }}
                    onClose={() => setShowWebcam(false)}
                  />
                )}

                <button onClick={markComplete} disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                    isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                    'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                  }`}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Submit Completion
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Task Overview</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => value > 0 ? `${value}` : null}>
                    {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Performance</h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {mapLocation && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl p-4 shadow-2xl flex flex-col border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-green-700" /> Directions to {mapLocation}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Interactive navigation</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSteps(!showSteps)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showSteps ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {showSteps ? 'Hide Steps' : 'Show Steps'}
                </button>
                <button onClick={() => { setMapLocation(null); setShowSteps(false); }}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
              <div className={`flex-1 rounded-xl overflow-hidden border-2 border-gray-200 ${showSteps ? 'md:w-2/3' : 'w-full'}`}>
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no"
                  src={`https://maps.google.com/maps?saddr=My+Location&daddr=${encodeURIComponent(mapLocation + ', Roorkee')}&dirflg=d&output=embed`}
                />
              </div>
              {showSteps && (
                <div className="w-full md:w-1/3 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto p-4">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Navigation className="w-4 h-4" /> Steps
                  </h4>
                  <p className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200">
                    Click "Directions" in the map panel to see step-by-step turn-by-turn instructions.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500">Open in Google Maps for voice navigation:</p>
              <a href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(mapLocation + ', Roorkee')}&travelmode=driving`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                <Navigation className="w-4 h-4" /> Open Maps App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboardView;
