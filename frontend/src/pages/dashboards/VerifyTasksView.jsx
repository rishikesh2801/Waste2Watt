import React from 'react';
import { Camera, Check, X, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const VerifyTasksView = () => {
  const { tasks, verifyTask } = useAppContext();
  
  // Only show tasks that workers have marked as completed (awaiting verification)
  const pendingVerificationTasks = tasks.filter(t => t.status === 'Pending Verification' || t.status === 'completed');

  const handleVerify = async (task, action) => {
    const taskId = task._id || task.id;
    const success = await verifyTask(taskId, action);
    if (success) {
        alert(`Task has been ${action}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
         <h3 className="text-xl font-bold text-municipal-dark">Verify Completed Tasks</h3>
         <p className="text-slate-500 mt-1">Review photo proofs and approve or reject completed duties.</p>
      </div>

      {pendingVerificationTasks.length === 0 ? (
        <div className="card-3d p-12 text-center flex flex-col items-center justify-center text-slate-500">
           <Check className="w-16 h-16 text-slate-300 mb-4" />
           <p className="text-xl font-bold">All caught up!</p>
           <p className="text-sm mt-2">There are no pending tasks waiting for verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pendingVerificationTasks.map(task => (
            <div key={task.id} className="card-3d bg-white/80 flex flex-col md:flex-row gap-6 p-6 items-start">
              
              {/* Photo Proof */}
              <div className="w-full md:w-1/2 aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 relative group shadow-sm">
                <img src={task.completionPhotoUrl || task.photo} alt="Task Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                   <Camera className="w-3 h-3" /> Photo Proof
                </div>
              </div>

              {/* Task Details */}
              <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-slate-400">{task.id}</span>
                     <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                       {task.status}
                     </span>
                   </div>
                   <h4 className="font-bold text-lg text-slate-800 leading-tight mb-2">{task.description || task.desc}</h4>
                   
                   <p className="text-sm flex items-center gap-1.5 text-slate-600 font-medium">
                     <User className="w-4 h-4 text-municipal-blue" />
                     {task.assignedToName || task.assignedTo}
                   </p>
                   <p className="text-xs text-slate-400 mt-1 pr-4">{task.createdAt ? new Date(task.createdAt).toLocaleString() : task.date}</p>
                 </div>
                 
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleVerify(task, 'rejected')}
                      className="flex-1 btn-outline px-2 py-2.5 flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleVerify(task, 'approved')}
                      className="flex-1 btn-primary bg-green-500 hover:bg-green-600 px-2 py-2.5 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifyTasksView;
