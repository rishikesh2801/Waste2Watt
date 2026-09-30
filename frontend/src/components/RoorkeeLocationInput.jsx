import React, { useState, useEffect } from 'react';

export const ROORKEE_LOCATIONS = [
  "IIT Roorkee Main Campus", "Civil Lines, Roorkee", "Ganeshpur, Roorkee", 
  "Ramnagar, Roorkee", "Sector 4, Roorkee", "Azad Nagar, Roorkee",
  "Malviya Chowk, Roorkee", "Mathura Vihar, Roorkee", "Salempur, Roorkee",
  "Cantonment Area, Roorkee", "Dhandera, Roorkee", "Rishabh Vihar, Roorkee", 
  "Railway Station Road, Roorkee", "BSM Chauraha, Roorkee", "Nehru Stadium, Roorkee",
  "Sonia Vihar, Roorkee", "Pabholi, Roorkee", "Rajendra Nagar, Roorkee"
];

const RoorkeeLocationInput = ({ value, onChange, placeholder }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (value.length >= 3) {
      const filtered = ROORKEE_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      // Only show if there's no exact match yet
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && !ROORKEE_LOCATIONS.includes(value));
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSelect = (loc) => {
    onChange(loc);
    // Use a small delay to ensure the input value updates before hiding
    setTimeout(() => setShowSuggestions(false), 50);
  };

  return (
    <div className="relative">
      <input 
        required
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
        onBlur={() => {
          // Longer timeout to capture clicks on suggestions
          setTimeout(() => setShowSuggestions(false), 300);
        }}
        placeholder={placeholder || "Type minimum 3 letters for Roorkee location..."}
        className="input-3d bg-white w-full"
      />
      {showSuggestions && (
        <ul className="absolute z-[100] w-full bg-white mt-2 rounded-xl shadow-2xl border border-slate-200 max-h-56 overflow-y-auto transform transition-all duration-200">
          {suggestions.map((loc, i) => (
            <li 
              key={i} 
              onMouseDown={(e) => {
                e.preventDefault(); // Critical: prevents blur from firing immediately
                handleSelect(loc);
              }}
              className="px-4 py-3 hover:bg-municipal-blue hover:text-white cursor-pointer text-sm font-semibold transition-colors border-b last:border-0 border-slate-100 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-municipal-blue group-hover:bg-white" />
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoorkeeLocationInput;
