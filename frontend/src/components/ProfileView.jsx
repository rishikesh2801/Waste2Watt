import React, { useState, useEffect } from 'react';
import { Camera, Save, Edit3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from './WebcamCapture';

const ProfileView = ({ data, onSave, isVehicleManager = false }) => {
  const { user, staffList, updateStaffProfile, setUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  
  // Try to find full employee data in staffList if it exists
  const fullUserData = staffList.find(s => s.email === user?.email) || {};

  const [profile, setProfile] = useState(data || {
    name: user?.name || fullUserData.name || 'Amit Kumar',
    email: user?.email || fullUserData.email || 'amit@mcr.gov.in',
    personalEmail: fullUserData.personalEmail || '',
    mobile: fullUserData.mobile || '+91 9876543210',
    employeeId: user?.id || fullUserData.id || 'N/A',
    role: user?.role || fullUserData.role || 'Mayor',
    aadhar: fullUserData.aadhar || '1234 5678 9012',
    fatherName: fullUserData.fatherName || 'Raj Kumar',
    photo: fullUserData.photo || '/logo.jpg',
    password: fullUserData.password || 'password',
    vehicleNumber: fullUserData.vehicleNumber || 'UK 08 AB 1234',
    assignedVehicle: fullUserData.assignedVehicle || 'Garbage Truck 04'
  });

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setProfile(p => ({ ...p, photo: fileUrl }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setIsEditing(false);
    
    // Check if we are updating the logged in user or a generic passed profile
    const targetId = data?.id || user?.id; // If Mayor, id might be missing, but mayor profile changes aren't strictly persisted in staff collection.
    
    if (targetId && updateStaffProfile) {
       const updated = await updateStaffProfile(targetId, profile);
       if (updated) {
           if (targetId === user?.id) {
               // Reflect name changes locally to context session if it's the current user
               setUser(prev => ({ ...prev, name: updated.name, email: updated.email }));
           }
           alert("Profile permanently updated successfully!");
       } else {
           alert("Failed to update profile. Server error.");
       }
    }
    
    if(onSave) onSave(profile);
  };

  const InputField = ({ label, name, type = 'text', readOnly }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
      <input 
        type={type} 
        name={name}
        value={profile[name] || ''} 
        onChange={handleChange}
        disabled={!isEditing || readOnly}
        className={`w-full ${isEditing && !readOnly ? 'input-3d bg-white' : 'input-3d opacity-80 cursor-not-allowed bg-slate-50'}`}
      />
    </div>
  );

  return (
    <div className="card-3d w-full max-w-4xl">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-municipal-dark">Personal Profile</h3>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center gap-2 py-2 px-4 shadow-none">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        ) : (
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-2 px-4">
            <Save className="w-4 h-4" /> Save
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full card-3d p-1 shadow-3d-dark bg-white overflow-hidden group">
            <img src={profile.photo} alt="Profile" className="w-full h-full object-cover rounded-full z-0 relative" />
            {isEditing && (
              <label htmlFor="profile-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 m-1">
                <Camera className="w-8 h-8 text-white" />
              </label>
            )}
          </div>
          {isEditing && (
             <div className="flex gap-3 justify-center">
               <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="profile-upload" />
               <label htmlFor="profile-upload" className="text-xs text-municipal-blue font-bold cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-all">Upload</label>

               <button type="button" onClick={() => setShowWebcam(true)} className="text-xs text-municipal-blue font-bold cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-all">
                 Camera
               </button>
             </div>
          )}
        </div>

        {showWebcam && (
          <WebcamCapture 
            onCapture={(dataUrl) => {
              setProfile(p => ({ ...p, photo: dataUrl }));
              setShowWebcam(false);
            }} 
            onClose={() => setShowWebcam(false)} 
          />
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="name" />
          <InputField label="Official Email" name="email" type="email" readOnly />
          <InputField label="Personal Email" name="personalEmail" type="email" />
          <InputField label="Employee ID" name="employeeId" readOnly />
          <InputField label="System Role" name="role" readOnly />
          <InputField label="Mobile Number" name="mobile" type="tel" />
          <InputField label="Aadhar Number" name="aadhar" />
          <InputField label="Father's Name" name="fatherName" />
          <InputField label="Account Password" name="password" type="text" />
          
          {isVehicleManager && (
             <>
                <InputField label="Vehicle Number" name="vehicleNumber" readOnly />
                <InputField label="Assigned Vehicle" name="assignedVehicle" readOnly />
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
