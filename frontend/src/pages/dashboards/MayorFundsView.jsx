import React, { useState } from 'react';
import FundUtilizationView from '../../components/FundUtilizationView';
import { useAppContext } from '../../context/AppContext';
import { IndianRupee, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

const MayorFundsView = () => {
  const { funds, updateFundUtilization } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [usedAmount, setUsedAmount] = useState('');
  const [status, setStatus] = useState(null);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const finalCategory = selectedCategory === 'other' ? newCategoryName.trim() : selectedCategory;
    
    if (!finalCategory) {
      setStatus({ type: 'error', msg: 'Please select or enter a category.' });
      return;
    }
    
    if (!allocatedAmount && !usedAmount) {
      setStatus({ type: 'error', msg: 'Please enter either an allocated amount or a utilized amount.' });
      return;
    }

    const allocNum = Number(allocatedAmount) || 0;
    const usedNum = Number(usedAmount) || 0;

    if (allocNum < 0 || usedNum < 0) {
      setStatus({ type: 'error', msg: 'Amounts cannot be negative.' });
      return;
    }

    setStatus(null);
    const success = await updateFundUtilization(finalCategory, allocNum, usedNum);
    
    if (success) {
      setStatus({ type: 'success', msg: `Successfully updated ${finalCategory}. Added ₹${allocNum.toLocaleString('en-IN')} to Allocated, and ₹${usedNum.toLocaleString('en-IN')} to Utilized.` });
      setAllocatedAmount('');
      setUsedAmount('');
      setSelectedCategory('');
      setNewCategoryName('');
      setTimeout(() => setStatus(null), 5000);
    } else {
      setStatus({ type: 'error', msg: 'Failed to update funds. Please try again.' });
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in pb-10">
      
      {/* Admin Panel: Add Fund Utilization */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-white border-2 border-[#1a3a6b] rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#1a3a6b]"></div>
          
          <h2 className="text-xl font-black text-[#1a3a6b] mb-2 flex items-center gap-2">
            <IndianRupee className="w-6 h-6" /> Update Fund Allocation & Utilization
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Add new allocations or log expenditures. These updates instantly reflect on the public citizen portal. Remaining funds are calculated automatically.
          </p>

          {status && (
            <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleAddFunds} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Fund Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                >
                  <option value="">-- Select Category --</option>
                  {funds.map(f => (
                    <option key={f.category} value={f.category}>{f.category}</option>
                  ))}
                  <option value="other" className="font-bold text-blue-600">➕ Other (Create New)</option>
                </select>
              </div>

              {selectedCategory === 'other' && (
                <div className="flex-1 w-full animate-fade-in">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 text-blue-600">What is it for?</label>
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name..."
                    className="w-full border-2 border-blue-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-blue-50"
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Allocated Amount to Add (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={allocatedAmount} 
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                    placeholder="e.g. 100000 (Optional)"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Utilized Amount to Add (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={usedAmount} 
                    onChange={(e) => setUsedAmount(e.target.value)}
                    placeholder="e.g. 50000 (Optional)"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-mono font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full md:w-auto bg-[#1a3a6b] hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> {selectedCategory === 'other' ? 'Create & Add' : 'Update Funds'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* The Global Read-Only View */}
      <FundUtilizationView />

    </div>
  );
};

export default MayorFundsView;
