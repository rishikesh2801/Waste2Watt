import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Home, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Live Clock — shows current IST time and date in sidebar
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <div className="mx-1 mb-2 bg-blue-900/60 border border-blue-700/60 rounded-xl px-3 py-2.5 text-center">
      <div className="text-white font-black text-lg tracking-widest font-mono">{timeStr}</div>
      <div className="text-blue-300 text-[10px] font-semibold mt-0.5 tracking-wide">{dateStr}</div>
    </div>
  );
};

// Brand Title — white version for dark blue sidebar
const BrandTitle = ({ dark = false }) => (
  <span className="font-black text-lg tracking-tight">
    <span className={dark ? 'text-[#1a3a6b]' : 'text-white'}>Waste</span>
    <span className="text-[#f97316]">2</span>
    <span className={dark ? 'text-[#1a3a6b]' : 'text-white'}>Watt</span>
  </span>
);

const DashboardLayout = ({ title, navItems, children }) => {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]       = useState([]);
  const [toastNotif, setToastNotif]             = useState(null);
  const prevTasksRef = useRef([]);

  const { user, tasks } = useAppContext();
  const navigate  = useNavigate();
  const location  = useLocation();

  const toggleSidebar = () => setSidebarOpen(s => !s);

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;
    const myTasks = tasks.filter(t =>
      (t.assignedToId === user.id || t.assignedTo === user.id) &&
      (t.status === 'assigned' || t.status === 'active')
    );
    const notifs = myTasks.map(t => ({
      id:    t.id || t._id,
      title: 'New Task Assigned',
      desc:  t.description || t.desc,
      time:  t.createdAt || t.date || new Date().toISOString(),
    }));
    setNotifications(notifs);

    if (prevTasksRef.current.length > 0) {
      const prevIds = prevTasksRef.current.map(t => t.id || t._id);
      const newTasks = myTasks.filter(t => !prevIds.includes(t.id || t._id));
      if (newTasks.length > 0) {
        setToastNotif({ title: 'New Task Assigned!', desc: newTasks[0].description || newTasks[0].desc });
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play();
        } catch(e) {}
        setTimeout(() => setToastNotif(null), 6000);
      }
    }
    prevTasksRef.current = tasks;
  }, [tasks, user]);

  const handleNotificationClick = () => {
    setShowNotifications(false);
    const r = user?.role;
    if (r === 'vehicle-manager' || r === 'collector') navigate(`/${r}`);
    else if (r === 'service-men') navigate('/service-men');
  };

  // Get current page label for breadcrumb
  const currentNav = navItems.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={toggleSidebar} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#1a3a6b] z-30
        flex flex-col h-full overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex md:h-screen
        shadow-2xl shrink-0
      `}>
        {/* Sidebar Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-800">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 bg-white p-0.5 shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <BrandTitle />
            <p className="text-[10px] text-blue-300 font-semibold mt-0.5 leading-tight">Smart Segregation,<br/>Clean Generation</p>
          </div>
          <button className="absolute top-4 right-4 md:hidden text-blue-300 hover:text-white transition-colors" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 border-b border-blue-800">
          <div className="bg-blue-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-base shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{user?.name || 'Staff User'}</p>
              <p className="text-blue-300 text-xs font-medium capitalize truncate">{user?.role?.replace('-', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                    : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: Clock + Home + Logout */}
        <div className="p-3 border-t border-blue-800 space-y-1">
          {/* Live Clock */}
          <LiveClock />
          <button onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-sm text-blue-200 hover:bg-blue-800/60 hover:text-white transition-all">
            <Home className="w-5 h-5 shrink-0" />
            <span>Back to Home</span>
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">

        {/* Top Header */}
        <header className="h-16 bg-white border-b-4 border-green-600 flex items-center justify-between px-5 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button className="md:hidden text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-black text-[#1a3a6b] hidden sm:block">
                <span className="text-[#1a3a6b]">Waste</span><span className="text-[#f97316]">2</span><span className="text-[#1a3a6b]">Watt</span>
              </span>
              {currentNav && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                  <span className="font-semibold text-green-700">{currentNav.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Bell */}
            <button onClick={() => setShowNotifications(s => !s)}
              className="relative p-2.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-14 right-0 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-50 animate-fade-in">
                <div className="bg-[#1a3a6b] p-4 flex justify-between items-center">
                  <h4 className="font-bold text-white">Notifications</h4>
                  <span className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-bold">{notifications.length} New</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm font-medium">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={handleNotificationClick}
                        className="p-4 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-1.5 shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{n.title}</p>
                            <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{n.desc}</p>
                            <p className="text-gray-400 text-[10px] mt-1.5 font-medium">{new Date(n.time).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <button onClick={() => setShowNotifications(false)}
                    className="w-full text-center text-xs text-green-700 font-bold hover:underline">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-base shadow-sm border-2 border-white uppercase cursor-pointer">
              {user?.name ? user.name[0] : 'U'}
            </div>
          </div>
        </header>

        {/* Page Title Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 shrink-0">
          <h1 className="text-xl font-black text-[#1a3a6b]">{title}</h1>
        </div>

        {/* Real-time Toast */}
        {toastNotif && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
            <div onClick={handleNotificationClick}
              className="bg-white border-l-4 border-green-600 rounded-2xl p-4 shadow-2xl shadow-green-500/10 flex gap-3 items-start cursor-pointer hover:bg-green-50 transition-colors">
              <div className="bg-green-100 text-green-700 p-2 rounded-xl shrink-0">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm">{toastNotif.title}</h4>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-snug line-clamp-2">{toastNotif.desc}</p>
                <p className="text-xs text-green-700 font-bold mt-2">Tap to view task →</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setToastNotif(null); }}
                className="text-gray-400 hover:text-gray-600 shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content — only this scrolls */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="max-w-7xl mx-auto pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
