import React, { useState } from 'react';
import { UserPlus, Mail, Briefcase, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AddEmployeeView = () => {
  const { setStaffList } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    role: 'Waste Collector',
    mobile: '',
    aadhar: '',
    fatherName: '',
    vehicleNumber: '',
    assignedVehicle: '',
  });
  
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneratedCredentials(null);
    
    // Generate a unique ID based on role prefix
    const rolePrefix = formData.role === 'Waste Collector' ? 'WC' : formData.role === 'Vehicle Manager' ? 'VM' : 'SM';
    const timestamp = Date.now().toString().slice(-4);
    const newId = `${rolePrefix}-${timestamp}`;
    const generatedOfficialEmail = `${rolePrefix.toLowerCase()}${timestamp}@mcr.gov.in`;

    setTimeout(() => {
      const newStaffEntry = {
        id: newId,
        name: formData.name,
        role: formData.role,
        email: generatedOfficialEmail,
        personalEmail: formData.personalEmail,
        mobile: formData.mobile,
        aadhar: formData.aadhar,
        fatherName: formData.fatherName,
        vehicleNumber: formData.role === 'Vehicle Manager' ? formData.vehicleNumber : undefined,
        assignedVehicle: formData.role === 'Vehicle Manager' ? formData.assignedVehicle : undefined,
        status: 'Available'
      };
      
      setStaffList(prev => [newStaffEntry, ...prev]);
      
      setIsSubmitting(false);
      
      setGeneratedCredentials({
        id: newId,
        email: generatedOfficialEmail,
        password: 'password'
      });
      
      setFormData({ 
        name: '', personalEmail: '', role: 'Waste Collector',
        mobile: '', aadhar: '', fatherName: '', vehicleNumber: '', assignedVehicle: ''
      });
      
    }, 1000);
  };

  return (
    <div className="card-3d max-w-2xl">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-municipal-dark">Onboard New Employee</h3>
        <p className="text-sm text-slate-500 mt-1">Create official credentials for new staff joining the corporation.</p>
      </div>

      {generatedCredentials && (
        <div className="mb-6 p-5 rounded-2xl bg-green-50 text-green-800 border-2 border-green-200 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-lg font-bold">System Credentials Activated!</span>
          </div>
          <p className="text-sm text-green-700 mb-4">Please securely copy these credentials and provide them to the newly onboarded employee.</p>
          
          <div className="bg-white p-4 rounded-xl border border-green-100 space-y-2 font-mono text-sm shadow-inner">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-500">Employee ID:</span>
              <span className="text-slate-800">{generatedCredentials.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-bold text-slate-500">Login Email:</span>
              <span className="text-municipal-blue">{generatedCredentials.email}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-slate-500">Temp Password:</span>
              <span className="text-rose-600">{generatedCredentials.password}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-municipal-blue" />
            Full Name
          </label>
          <input 
            required
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="E.g., Arjun Roy" 
            className="input-3d bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-municipal-blue" />
            Personal Email Address
          </label>
          <input 
            required
            type="email" 
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleInputChange}
            placeholder="arjun.personal@gmail.com" 
            className="input-3d bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-municipal-blue" />
            Assign Role (Post)
          </label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="input-3d bg-white cursor-pointer"
          >
            <option value="Waste Collector">Waste Collector</option>
            <option value="Vehicle Manager">Vehicle Manager</option>
            <option value="Service Men">Service Men</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Mobile Number</label>
          <input required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91 9876543210" className="input-3d bg-white" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Aadhar Number</label>
          <input required type="text" name="aadhar" value={formData.aadhar} onChange={handleInputChange} placeholder="1234 5678 9012" className="input-3d bg-white" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Father's Name</label>
          <input required type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Raj Kumar" className="input-3d bg-white" />
        </div>

        {formData.role === 'Vehicle Manager' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Vehicle Number</label>
              <input required type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="UK 08 AB 1234" className="input-3d bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Assigned Vehicle</label>
              <input required type="text" name="assignedVehicle" value={formData.assignedVehicle} onChange={handleInputChange} placeholder="Garbage Truck 04" className="input-3d bg-white" />
            </div>
           </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || !formData.name || !formData.personalEmail}
            className={`btn-primary px-8 ${(!formData.name || !formData.personalEmail) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeView;
