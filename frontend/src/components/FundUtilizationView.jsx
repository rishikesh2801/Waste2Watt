import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const FundUtilizationView = () => {
  const { funds } = useAppContext();

  if (!funds || funds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-bold">Loading Financial Data...</p>
      </div>
    );
  }

  // Calculate totals
  const totalAllocated = funds.reduce((acc, f) => acc + f.allocated, 0);
  const totalUsed = funds.reduce((acc, f) => acc + f.used, 0);
  const totalLeft = totalAllocated - totalUsed;
  const utilizedPct = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  const chartData = [
    { name: 'Funds Used', value: totalUsed },
    { name: 'Funds Left', value: totalLeft },
  ];
  const COLORS = ['#ef4444', '#10b981'];

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatCrores = (val) => `₹${(val / 10000000).toFixed(2)} Cr`;

  return (
    <div className="space-y-8 animate-fade-in py-8 px-4 max-w-7xl mx-auto w-full">
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-[#1a3a6b] uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          Financial Transparency
        </span>
        <h2 className="text-3xl font-black text-gray-800 mt-4 mb-2">Fund Allocation & Utilization</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Real-time transparency on public funds allocated to Waste2Watt — where every rupee is going and how much has been utilized.
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Allocated', value: formatCrores(totalAllocated), sub: 'Financial Year 2026–27', color: 'blue',   pct: null, icon: IndianRupee },
          { label: 'Amount Utilized', value: formatCrores(totalUsed), sub: `${utilizedPct.toFixed(1)}% of total budget`,  color: 'green',  pct: utilizedPct, icon: TrendingDown },
          { label: 'Remaining Balance', value: formatCrores(totalLeft), sub: 'Q4 FY2026–27 pending',  color: 'orange', pct: 100 - utilizedPct, icon: TrendingUp },
        ].map(({ label, value, sub, color, pct, icon: Icon }) => (
          <div key={label} className={`bg-white border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            color==='blue'?'border-blue-100':color==='green'?'border-green-100':'border-orange-100'
          }`}>
            <Icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 ${
                color==='blue'?'text-blue-700':color==='green'?'text-green-700':'text-orange-700'
            }`} />
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 relative z-10 ${
              color==='blue'?'text-blue-700':color==='green'?'text-green-700':'text-orange-700'
            }`}>{label}</p>
            <p className={`text-4xl font-black mb-1 relative z-10 ${
              color==='blue'?'text-[#1a3a6b]':color==='green'?'text-green-700':'text-orange-600'
            }`}>{value}</p>
            <p className="text-xs text-gray-400 font-semibold relative z-10">{sub}</p>
            {pct !== null && (
              <div className="mt-4 relative z-10">
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    color==='green' ? 'bg-green-500' : 'bg-orange-400'
                  }`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-black text-gray-800 mb-6">Budget Overview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-black text-gray-800 mb-6">Category Utilization (₹)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funds} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 12}} />
                <YAxis dataKey="category" type="category" width={150} tick={{fontSize: 11}} />
                <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" fill="#cbd5e1" radius={[0,4,4,0]} />
                <Bar dataKey="used" name="Used" fill="#16a34a" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-[#1a3a6b] px-6 py-5 flex items-center justify-between">
          <h3 className="text-white font-black text-lg">Detailed Category Breakdown</h3>
          <span className="text-xs font-bold text-blue-200 bg-blue-800/50 border border-blue-700 px-3 py-1.5 rounded-full">FY 2026–27</span>
        </div>
        <div className="divide-y divide-gray-100">
          {funds.map(({ category, allocated, used, color }) => {
            const pct = Math.round((used / allocated) * 100) || 0;
            return (
              <div key={category} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-sm font-bold text-gray-800">{category}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-sm shrink-0">
                    <span className="text-gray-500 font-medium hidden sm:block">Alloc: <span className="font-bold text-gray-700">₹{allocated/100000}L</span></span>
                    <span className="text-gray-500 font-medium">Used: <span className="font-bold text-gray-700">₹{used/100000}L</span></span>
                    <span className={`font-black text-sm min-w-[40px] text-right ${pct >= 80 ? 'text-green-700' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold">* Data dynamically synced from backend · Amounts in Lakhs (L)</p>
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">✓ Live Database Feed</span>
        </div>
      </div>
    </div>
  );
};

export default FundUtilizationView;
