import React, { createContext, useState, useContext, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [funds, setFunds] = useState([]);

  // Fetch initial data from Backend on mount and poll every 10 seconds
  useEffect(() => {
    fetchStaff();
    fetchComplaints();
    fetchTasks();
    fetchFunds();
    
    // Poll to keep devices in sync
    const interval = setInterval(() => {
      fetchComplaints();
      fetchTasks();
      fetchStaff();
      fetchFunds();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints', {
        headers: { 'ngrok-skip-browser-warning': 'any' }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setComplaints(data.map(c => ({ ...c, id: c.trackingId || c._id || c.id })));
        }
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'ngrok-skip-browser-warning': 'any' }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data.map(t => ({ ...t, id: t._id || t.id })));
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchFunds = async () => {
    try {
      const res = await fetch('/api/funds', { headers: { 'ngrok-skip-browser-warning': 'any' } });
      if (res.ok) {
        const data = await res.json();
        setFunds(data);
      }
    } catch (err) {
      console.error("Failed to fetch funds:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff', { headers: { 'ngrok-skip-browser-warning': 'any' } });
      if (res.ok) {
         const data = await res.json();
         if (data && data.length > 0) setStaticStaff(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  const updateStaffProfile = async (id, updatedData) => {
      try {
          const res = await fetch(`/api/staff/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedData)
          });
          if (res.ok) {
              const updatedStaff = await res.json();
              setStaticStaff(p => p.map(s => s.id === updatedStaff.id ? updatedStaff : s));
              return updatedStaff;
          }
      } catch (err) {
          console.error("Staff update failed: ", err);
      }
      return null;
  };

  const deleteStaff = async (id) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'any' }
      });
      if (res.ok) {
        setStaticStaff(p => p.filter(s => s.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Staff deletion failed:", err);
    }
    return false;
  };

  const updateFundUtilization = async (category, allocatedToAdd, usedToAdd) => {
    try {
      const res = await fetch('/api/funds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, allocatedToAdd, usedToAdd })
      });
      if (res.ok) {
        const updatedFund = await res.json();
        setFunds(p => {
          const exists = p.find(f => f.category === category);
          if (exists) return p.map(f => f.category === category ? updatedFund : f);
          return [...p, updatedFund];
        });
        return true;
      }
    } catch (err) {
      console.error("Fund update failed:", err);
    }
    return false;
  };

  const addComplaint = (complaint) => {
    // This is now handled by ComplaintPage.jsx calling the API directly 
    // due to multipart/form-data requirements. We just refresh the list.
    fetchComplaints();
  };

  const resolveComplaint = async (id) => {
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setComplaints((prev) => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
        // Also refresh tasks — backend auto-completes linked tasks on resolve
        await fetchTasks();
        alert("✅ Complaint marked as Resolved in Database!");
      }
    } catch (err) {
      console.error("Resolution failed:", err);
    }
  };

  const deleteComplaint = async (id) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'any' }
      });
      if (res.ok) {
        setComplaints((prev) => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  const bulkDeleteComplaints = async (ids) => {
    // Just delete them iteratively to save time creating a backend bulk endpoint
    await Promise.all(ids.map(id => fetch(`/api/complaints/${id}`, {
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'any' }
    })));
    setComplaints((prev) => prev.filter(c => !ids.includes(c.id)));
    alert(`🗑️ Successfully deleted ${ids.length} complaints.`);
  };

  // Generate Staff List (20 Collectors, 15 Vehicle Managers, 10 Service Men)
  const generateStaff = () => {
    let staff = [];
    const names = [
      'Amit Kumar', 'Rohan Singh', 'Suresh Verma', 'Pooja Sharma', 'Neha Singh',
      'Rajesh Patel', 'Sandeep Sharma', 'Anjali Patel', 'Sneha Verma', 'Priya Das',
      'Manoj Tiwari', 'Anil Das', 'Vikas Yadav', 'Sanjay Gupta', 'Rahul Joshi',
      'Riya Yadav', 'Kavita Gupta', 'Deepak Choudhury', 'Akash Reddy', 'Sunil Mishra',
      'Aarti Joshi', 'Swati Choudhury', 'Mukesh Agarwal', 'Ravi Kumar', 'Vijay Singh',
      'Jyoti Reddy', 'Nisha Mishra', 'Dinesh Patel', 'Puneet Sharma', 'Yash Verma',
      'Rashmi Agarwal', 'Shilpa Kumar', 'Aditya Rao', 'Kiran Das', 'Ramesh Yadav',
      'Monika Singh', 'Rekha Patel', 'Manish Gupta', 'Satish Joshi', 'Anita Sharma',
      'Geeta Verma', 'Sita Rao', 'Suman Das', 'Meena Yadav', 'Arun Patel'
    ];
    let nameIdx = 0;

    const generateProfile = (index) => {
       const hashStr = ((index + 1) * 137).toString().padStart(3, '0');
       const idStr = index.toString().padStart(2, '1');
       const lastName = names[index].split(' ')[1] || 'Kumar';
       return {
         mobile: `+91 98${idStr}45${hashStr}`,
         aadhar: `4${idStr}7 8${hashStr} 12${idStr}`,
         fatherName: `Rajendra ${lastName}`,
       };
    };

    for(let i=1; i<=20; i++) {
        staff.push({ 
            id: `WC-${i}`, name: names[nameIdx], role: 'Waste Collector', status: 'Available', email: `wc${i}@mcr.gov.in`, 
            ...generateProfile(nameIdx) 
        });
        nameIdx++;
    }
    for(let i=1; i<=15; i++) {
        staff.push({ 
            id: `VM-${i}`, name: names[nameIdx], role: 'Vehicle Manager', status: 'Available', email: `vm${i}@mcr.gov.in`, 
            vehicleNumber: `UK 08 AB ${1000 + i}`, assignedVehicle: `Garbage Truck ${i < 10 ? '0'+i : i}`,
            ...generateProfile(nameIdx) 
        });
        nameIdx++;
    }
    for(let i=1; i<=10; i++) {
        staff.push({ 
            id: `SM-${i}`, name: names[nameIdx], role: 'Service Men', status: 'Available', email: `sm${i}@mcr.gov.in`, 
            ...generateProfile(nameIdx) 
        });
        nameIdx++;
    }
    return staff;
  };

  const [staticStaff, setStaticStaff] = useState(generateStaff());

  const staffList = staticStaff.map(s => {
      // Service Men don't typically get 'Busy' via standard tasks because they assign them.
      if (s.role === 'Service Men') return s;
      const isBusy = tasks.some(t => t.assignedToId === s.id && (t.status === 'assigned' || t.status === 'active'));
      return { ...s, status: isBusy ? 'Busy' : 'Available' };
  });

  const setStaffList = setStaticStaff;

  const addTask = async (task) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: task.desc,
          assignedToId: task.assignedTo,
          assignedToName: task.assignedToName,
          assignedByRole: task.assignedBy,
          location: task.location,
          timeAllotted: task.timeAllotted,
          linkedComplaintId: task.linkedComplaintId
        })
      });
      
      if (res.ok) {
        const savedTask = await res.json();
        setTasks(prev => [savedTask, ...prev]);
        return savedTask;
      }
    } catch (err) {
      console.error("Task assignment failed:", err);
    }
  };

  const startTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/start`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'any' }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(p => p.map(t => (t.id === taskId || t._id === taskId) ? { ...t, status: 'active', startTime: data.task.startTime } : t));
      }
    } catch (err) {
      console.error("Task start failed:", err);
    }
  };

  const completeTask = async (taskId, photoBlob, notes) => {
    try {
      const fd = new FormData();
      if (photoBlob) fd.append('photo', photoBlob);
      if (notes)     fd.append('notes', notes);
      
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        body: fd
      });
      
      if (res.ok) {
        const result = await res.json();
        setTasks(p => p.map(t => (t.id === taskId || t._id === taskId) ? result.task : t));
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Task complete failed:', err.msg || res.status);
      }
    } catch (err) {
      console.error("Task completion failed:", err);
    }
    return false;
  };

  const verifyTask = async (taskId, action) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'approved' ? 'approved' : 'rejected' })
      });
      
      if (res.ok) {
        const result = await res.json();
        const updatedTask = result.task;
        
        setTasks(p => p.map(t => (t.id === taskId || t._id === taskId) ? updatedTask : t));
        
        if (action === 'approved' && updatedTask.linkedComplaintId) {
          resolveComplaint(updatedTask.linkedComplaintId);
        }
        return true;
      }
    } catch (err) {
      console.error("Task verification failed:", err);
    }
    return false;
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      complaints, setComplaints, fetchComplaints, addComplaint, resolveComplaint, deleteComplaint, bulkDeleteComplaints,
      staffList, setStaffList, updateStaffProfile, deleteStaff,
      tasks, addTask, fetchTasks, startTask, completeTask, verifyTask, setTasks,
      funds, updateFundUtilization
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
