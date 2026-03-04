import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketTable from './TicketTable';
import TicketModal from './TicketModal';
import AddTicketForm from './AddTicketForm';
import html2canvas from 'html2canvas';
import peoplesLogo from '../assets/Peoples bank logo.png';
import hdfcLogo from '../assets/hdfc bank logo.png';
import mainLogo from '../assets/logo.png';

  const Dashboard = ({ activeCategory, setActiveCategory, darkMode, setDarkMode }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalEditing, setModalEditing] = useState(false);
  const [onlyWithCreated, setOnlyWithCreated] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

const filteredTickets = (tickets || []).filter((t) => {
  // 1. Search Query Filter
  const q = (searchQuery || '').trim().toLowerCase();
  if (q) {
    const hay = `${t.ticketId || ''} ${t.subject || ''} ${t.requester || ''} ${t.assignedTechnician || ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  // 2. Category logic 
  if (activeCategory === 'peoples') {
    // People's Bank ටැබ් එකේ පෙන්වන්නේ එම බැංකුවේ ටිකට් පමණි
    if (!(t.bankName === "People's Bank")) return false;
  } 
  else if (activeCategory === 'hdfc') {
    // HDFC Bank ටැබ් එකේ පෙන්වන්නේ එම බැංකුවේ ටිකට් පමණි
    if (!(t.bankName === "HDFC Bank")) return false;
  } 
  else if (activeCategory === 'daily') {
    // Daily Tickets ටැබ් එකේ පෙන්වන්නේ People's හෝ HDFC නොවන (Other) ටිකට් පමණි
    if (t.bankName === "People's Bank" || t.bankName === "HDFC Bank") return false;
  }

  if (statusFilter !== 'All') {
    const currentStatus = t.status === 'Open' ? 'Assigned' : t.status;
    if (currentStatus !== statusFilter) return false;
  }

  // 3. Date Range Filter
  const ticketDate = t.dateCreated ? new Date(t.dateCreated) : (t.createdDate ? new Date(t.createdDate) : null);

  if (ticketDate) {
    if (filterStart) {
      const start = new Date(filterStart);
      start.setHours(0, 0, 0, 0);
      if (ticketDate < start) return false;
    }
    if (filterEnd) {
      const end = new Date(filterEnd);
      end.setHours(23, 59, 59, 999);
      if (ticketDate > end) return false;
    }
  } else if (filterStart || filterEnd) {
    return false;
  }

  return true;
});

  const categories = [
    { 
    id: 'daily', 
    label: 'FIT', 
    icon: <img src={mainLogo} className="w-6 h-6 object-contain inline-block" />, 
    color: 'from-green-500 to-emerald-600' 
  },
    { id: 'peoples', label: 'People\'s Bank', icon: <img src={peoplesLogo} className="w-6 h-6 object-contain inline-block" />, color: 'from-yellow-400 to-red-600' },
    { 
    id: 'hdfc', 
    label: 'HDFC Bank', 
    icon: <img src={hdfcLogo} className="w-6 h-6 object-contain inline-block" />, 
    color: 'from-blue-600 to-red-600' 
  }
  ];

  const categoryInfo = {
   daily: { 
  title: 'FIT Tickets', 
  bgGradient: 'from-green-500 to-orange-400', 
  icon: (
    <img 
      src={mainLogo} 
      alt="NOC Logo" 
      className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-2xl brightness-110 transition-transform duration-300 hover:scale-105" 
    />
  ),
  lightBg: 'from-indigo-50 via-white to-purple-50',
  darkBg: 'from-slate-900 to-slate-700' 
},
    peoples: { 
    title: "People's Bank Tickets", 
    bgGradient: 'from-yellow-400 via-yellow-500 to-red-600', 
    icon: <img src={peoplesLogo} alt="Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105" />,
    lightBg: 'from-yellow-50 to-red-50',
    darkBg: 'from-slate-900 to-red-900'
  },
    hdfc: { 
    title: 'HDFC Bank Tickets', 
    bgGradient: 'from-blue-800 via-blue-700 to-red-600', 
    icon: <img src={hdfcLogo} alt="HDFC Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105" />,
    lightBg: 'from-blue-50 to-red-50',
    darkBg: 'from-slate-900 to-blue-900'
  }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeCategory, onlyWithCreated]);

  const fetchTickets = async () => {
  setLoading(true);
  
  let url = 'http://localhost:5000/api/tickets';

  if (activeCategory === 'daily') {
    url = 'http://localhost:5000/api/tickets'; 
  } else if (activeCategory === 'peoples') {
    url += `/bank/${encodeURIComponent("People's Bank")}`;
  } else if (activeCategory === 'hdfc') {
    url += `/bank/${encodeURIComponent("HDFC Bank")}`;
  }

  if (onlyWithCreated) {
    url += (url.includes('?') ? '&' : '?') + 'hasCreated=true';
  }

  try {
    const res = await axios.get(url);
    setTickets(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    setTickets([]);
  } finally {
    setLoading(false);
  }
};

  const handleView = (ticket, openInEdit = false) => {
    setSelectedTicket(ticket);
    setModalEditing(openInEdit);
    setShowModal(true);
  };

  const handleDelete = async (ticketOrId) => {
    const id = typeof ticketOrId === 'string' ? ticketOrId : ticketOrId?._id;
    if (!id) return;
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tickets/${id}`);
      await fetchTickets();
      
      if (showModal && selectedTicket && selectedTicket._id === id) {
        handleCloseModal();
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete ticket');
    }
  };

  const handleUpdate = async (id, data) => {
  try {
    const res = await axios.put(`http://localhost:5000/api/tickets/${id}`, data);
    
    
    setTickets(prevTickets => 
      prevTickets.map(t => t._id === id ? res.data : t)
    );

    setSelectedTicket(res.data);
  } catch (err) {
    console.error('Update failed', err);
    throw err;
  }
};

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setModalEditing(false);
  };

  const downloadTableImage = async (format = 'png') => {
    try {
      const el = document.getElementById('tickets-table');
      if (!el) return alert('Tickets table not found');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `tickets-${new Date().toISOString().slice(0,10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate image');
    }
  };

  const info = categoryInfo[activeCategory] || categoryInfo.daily;
  

const currentTickets = filteredTickets || [];  
const assignedCount = (tickets || []).filter(t => t.status === 'Assigned' || t.status === 'Open').length;
const resolvedCount = (tickets || []).filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
const inProgressCount = (tickets || []).filter(t => t.status === 'In Progress').length;

const stats = [
  { 
    label: 'Total Tickets', 
    value: currentTickets.length, 
    bgColor: 'from-indigo-500 to-blue-600', 
    icon: '📊', 
    change: '+12% from last week' 
  },
  { 
    label: 'Assigned Tickets', 
    value: assignedCount, 
    bgColor: 'from-red-500 to-pink-600', 
    icon: '🔴', 
    change: 'Requires attention' 
  },
  { 
    label: 'In Progress', 
    value: inProgressCount, 
    bgColor: 'from-amber-500 to-orange-600', 
    icon: '⏳', 
    change: 'Being resolved' 
  },
  { 
    label: 'Resolved', 
    value: resolvedCount, 
    bgColor: 'from-green-500 to-emerald-600', 
    icon: '✅', 
    change: '+24% this month' 
  }
];

  return (
    <div className={`w-full bg-gradient-to-br ${darkMode ? info.darkBg : info.lightBg} min-h-screen pb-8`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">NOC Open Tickets</h1>
                <span className="text-sm text-slate-500 hidden sm:inline">NOC Dashboard</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tickets..." className="w-64 md:w-96 px-4 py-2 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white dark:bg-slate-700 dark:text-white"/>
            </div>
            
          </div>
        </div>

        {/* Category Navigation */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-wrap gap-3 justify-center relative">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 md:px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}

          {/* theme toggle for smaller screens */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Main Header with Hero Effect */}
<div className={`bg-gradient-to-r ${info.bgGradient} rounded-3xl shadow-2xl p-6 md:p-10 text-white relative overflow-hidden`}>
  {/* Background එකේ පෙනෙන ලොකු දිය සළකුණ (Watermark) */}
  <div className="absolute top-0 right-0 text-9xl opacity-10 translate-x-10 -translate-y-5 select-none">
    {typeof info.icon === 'string' ? info.icon : '🏦'}
  </div>

  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
    {/* මෙතැනදී පින්තූරය හෝ Emoji එක පෙන්වයි */}
    <div className="flex-shrink-0 animate-in zoom-in duration-500">
      {info.icon}
    </div>

    <div className="text-center md:text-left">
      <h1 className="text-4xl md:text-6xl font-black mb-2 drop-shadow-lg tracking-tight">
        {info.title}
      </h1>
      <p className="text-lg md:text-xl text-white/90 font-medium">
        Managing <span className="bg-white/20 dark:bg-slate-700/20 px-3 py-1 rounded-full font-bold text-2xl mx-1">{filteredTickets.length}</span> tickets in this category
      </p>
    </div>
  </div>
</div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl shadow-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-slate-600 opacity-5 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl">{stat.icon}</span>
                  <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">↗</span>
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold opacity-90 uppercase tracking-widest mb-2">{stat.label}</h3>
                <p className="text-5xl font-black mb-3">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.change}</p>
                <div className="mt-4 h-1 bg-white/30 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 md:px-8 py-3 md:py-4 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-2xl ${
              showAddForm 
                ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            {showAddForm ? '❌ Cancel Form' : '➕ Add New Ticket'}
          </button>
          
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50"
          >
            🔄 Refresh Data
          </button>

          <div className="ml-auto hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-xl border-2 border-green-300">
            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-700 font-semibold">Live Updates</span>
          </div>
        </div>

        {/* Add Ticket Form */}
        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-6 md:px-8 py-6 md:py-8 text-white`}>
              <h2 className="text-3xl md:text-4xl font-black">🎫 Create New Ticket</h2>
              <p className="text-purple-100 mt-2">Fill in the details below to create a support ticket</p>
            </div>
            <div className="p-6 md:p-8">
              <AddTicketForm 
                onTicketAdded={() => {
                  fetchTickets();
                  setShowAddForm(false);
                }} 
              />
            </div>
          </div>
        )}

        {/* Tickets Table Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${info.bgGradient} px-6 md:px-8 py-6 md:py-8`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">All Tickets</h2>
                <p className="text-white/80 mt-2">Number of Tickets : {filteredTickets.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="search" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search (ID, subject, requester, tech)..." className="px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none" />
                <input 
    type="date" 
    value={filterStart} 
    onChange={(e) => setFilterStart(e.target.value)} 
    className="px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none" 
  />
  <span className="text-white/70">to</span>
  <input 
    type="date" 
    value={filterEnd} 
    onChange={(e) => setFilterEnd(e.target.value)} 
    className="px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none" 
  />
  {/* Status Dropdown */}
<select 
  value={statusFilter} 
  onChange={(e) => setStatusFilter(e.target.value)}
  className="px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white outline-none focus:bg-white/10 transition-all cursor-pointer"
>
  <option value="All" className="bg-white text-slate-800">All Status</option>
  <option value="Assigned" className="bg-white text-slate-800">Assigned</option>
  <option value="In Progress" className="bg-white text-slate-800">In Progress</option>
  <option value="Resolved" className="bg-white text-slate-800">Resolved</option>
</select>
  <button 
    onClick={() => { setFilterStart(''); setFilterEnd(''); setSearchQuery(''); setStatusFilter('All'); }} 
    className="px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
  >
    Clear
  </button>
          
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-600"></div>
                  <p className="text-center mt-6 text-gray-600 font-bold text-lg">Loading tickets...</p>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-7xl mb-6">📭</div>
                <p className="text-gray-600 text-2xl font-bold mb-2">No tickets found</p>
                <p className="text-gray-500">Start by creating a new ticket using the button above</p>
              </div>
            ) : (
              !showModal ? (
                filteredTickets.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600 mb-4">No tickets match your filters.</p>
                    <button onClick={() => { setFilterStart(''); setFilterEnd(''); setSearchQuery(''); fetchTickets(); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Clear filters</button>
                  </div>
                ) : (
                  <TicketTable tickets={filteredTickets} onView={handleView} onEdit={(t) => handleView(t, true)} onDelete={handleDelete} />
                )
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Ticket details are open — table hidden.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          initialEditing={modalEditing}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onDelete={async (id) => { await handleDelete(id); }}
        />
      )}

    </div>
  );
};

export default Dashboard;
