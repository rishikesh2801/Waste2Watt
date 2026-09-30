import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import { Trash2, User, Search, Phone, Mail, AlertTriangle, X } from 'lucide-react';

const MayorEmployeeList = () => {
  const { staffList, deleteStaff } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Deletion Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, staffId: null, staffName: '' });
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const openDeleteModal = (id, name) => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError(false);
    setDeleteModal({ isOpen: true, staffId: id, staffName: name });
  };

  const confirmDelete = async () => {
    if (captchaInput !== captcha) {
      setCaptchaError(true);
      return;
    }
    
    setIsDeleting(true);
    await deleteStaff(deleteModal.staffId);
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, staffId: null, staffName: '' });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto px-4 relative">
      
      {/* Delete Confirmation Modal using React Portal to prevent clipping/scrolling issues */}
      {deleteModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-center justify-between">
              <h3 className="text-red-700 font-black text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Confirm Termination
              </h3>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })}
                className="text-red-400 hover:text-red-700 hover:bg-red-100 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 font-medium mb-6">
                Are you sure you want to remove or fire <strong className="text-black">{deleteModal.staffName} ({deleteModal.staffId})</strong>? This action is permanent and cannot be undone.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Security Check (Captcha)
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white font-mono font-bold text-xl px-4 py-2 rounded-lg tracking-widest flex-1 text-center select-none shadow-inner">
                    {captcha}
                  </div>
                  <button type="button" onClick={() => setCaptcha(generateCaptcha())} className="text-xs text-blue-600 font-bold hover:underline">
                    Refresh
                  </button>
                </div>
                <input 
                  type="text" 
                  value={captchaInput}
                  onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(false); }}
                  placeholder="Enter the 5 characters above"
                  className={`w-full border ${captchaError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {captchaError && <p className="text-xs text-red-600 font-bold mt-2">Captcha does not match!</p>}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting || captchaInput.length !== 5}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : <><Trash2 className="w-4 h-4"/> Confirm Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border-2 border-[#1a3a6b] shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#1a3a6b] flex items-center gap-2">
            <User className="w-6 h-6" /> Employee Directory
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage Waste Collectors, Vehicle Managers, and Servicemen.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">
                    No employees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm shrink-0">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{staff.name}</div>
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded mt-0.5 inline-block">{staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {staff.mobile}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {staff.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {staff.role}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          staff.status === 'Available' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-orange-700 bg-orange-50 border border-orange-200'
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openDeleteModal(staff.id, staff.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-bold"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MayorEmployeeList;
