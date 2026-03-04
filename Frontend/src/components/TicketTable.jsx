import React, { useState } from 'react'; 
import * as htmlToImage from 'html-to-image';

const TicketTable = ({ tickets, onView = () => {}, onEdit = () => {}, onDelete = () => {} }) => {
  
  const [showTodayOnly, setShowTodayOnly] = useState(false);


  const filteredTickets = showTodayOnly 
    ? tickets.filter(ticket => {
        const ticketDate = new Date(ticket.dateCreated).toDateString();
        const today = new Date().toDateString();
        return ticketDate === today;
      })
    : tickets;

  const downloadTableAsImage = async () => {
    const element = document.getElementById('tickets-table');
    if (!element) return;

    try {
      const width = element.scrollWidth;
      const height = element.scrollHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2,
        width: width,
        height: height,
        style: {
          transform: 'none',
          margin: '0',
          padding: '20px',
        },
        filter: (node) => {
          if (node.classList && node.classList.contains('actions-column')) {
            return false;
          }
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `Tickets-Report-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Image එක generate කිරීමේදී ගැටලුවක් මතු විය.');
    }
  };

  const getStatusBadge = (status) => {
    const baseStyle = 'px-3 py-1 rounded-full text-[12px] font-bold inline-block shadow-sm whitespace-nowrap';
    const badges = {
      Assigned: `bg-red-500 text-white ${baseStyle}`,
      Resolved: `bg-green-600 text-white ${baseStyle}`,
      'In Progress': `bg-blue-600 text-white ${baseStyle}`
    };
    const currentStatus = status === 'Open' ? 'Assigned' : status;
    return badges[currentStatus] || badges.Assigned;
  };

  const getRowStyle = (status) => {
    const s = status === 'Open' ? 'Assigned' : status;
    switch (s) {
      case 'Resolved': return { backgroundColor: '#c6ffc6' }; 
      case 'Assigned': return { backgroundColor: '#fcfca7' }; 
      case 'In Progress': return { backgroundColor: '#bfe1f6' }; 
      default: return { backgroundColor: '#ffffff' };
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Helper function to find the most recent update time
const getLatestUpdateTime = (ticketList) => {
  if (!ticketList?.length) return '—';

  // Find ticket with the latest updated time
  const latestTicket = ticketList.reduce((latest, current) => {
    // Use lastUpdated or updatedAt if exists, otherwise fallback to dateCreated
    const currentTime = new Date(current.lastUpdated || current.updatedAt || current.dateCreated || 0);
    const latestTime = new Date(latest.lastUpdated || latest.updatedAt || latest.dateCreated || 0);

    return currentTime > latestTime ? current : latest;
  }, ticketList[0]);

  const latestDate = new Date(
    latestTicket.lastUpdated || 
    latestTicket.updatedAt || 
    latestTicket.dateCreated
  );

  // Format: 09 Feb 2025, 6:41 PM
  return latestDate.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  return (
    <div className="space-y-4">
      {/* Filter සහ Download Button සහිත කොටස */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox" 
            className="w-5 h-5 accent-green-600 cursor-pointer"
            checked={showTodayOnly}
            onChange={(e) => setShowTodayOnly(e.target.checked)}
          />
          <span className="font-semibold text-slate-700 text-sm">📅 Show Today's Tickets Only</span>
          {showTodayOnly && (
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase">Active</span>
          )}
        </label>

        {/* Last Updated - shows the most recent update time */}
    {filteredTickets.length > 0 && (
      <div className="text-sm flex items-center gap-2 text-slate-600">
        <span className="font-medium">🔄 Last Updated:</span>
        <span className="font-semibold text-slate-800">
          {getLatestUpdateTime(filteredTickets)}
        </span>
      </div>
    )}

        <button 
          onClick={downloadTableAsImage}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-all font-medium text-sm"
        >
          <span>📸</span> Download PNG
        </button>
      </div>

      {isMobile ? (
        <div id="tickets-table" className="space-y-4 p-2 bg-white dark:bg-slate-800 dark:text-slate-200">
          {/* මෙතනදී අපි filteredTickets භාවිතා කරනවා */}
          {filteredTickets.map((ticket) => (
            <div key={ticket._id} style={getRowStyle(ticket.status)} className="rounded-lg p-4 border border-slate-200 text-left transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{ticket.ticketId}</h3>
                  <p className="text-sm text-gray-600 font-normal">{ticket.requester || '—'}</p>
                </div>
                <span className={getStatusBadge(ticket.status)}>
                  {ticket.status === 'Open' ? 'Assigned' : ticket.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3 font-normal leading-relaxed">
                {ticket.subject || 'No subject'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
                <span>👤 {ticket.assignedTechnician}</span>
                <span>📅 {new Date(ticket.dateCreated).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 actions-column">
                <button onClick={() => onView(ticket)} className="flex-1 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold shadow-md">View</button>
                <button onClick={() => onEdit(ticket)} className="px-3 py-2 rounded-lg bg-amber-400 text-white text-sm font-semibold shadow-md">Update</button>
                {/* notes button (same as update) */}
                <button onClick={() => onEdit(ticket)} className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow-md">Notes</button>
                <button onClick={() => onDelete(ticket)} className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold shadow-md">Delete</button>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500">No tickets found for today.</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <table id="tickets-table" className="w-full table-fixed min-w-[1000px] bg-white dark:bg-slate-800">
            <thead>
              <tr className="bg-[#2D3748] text-white">
                <th className="w-[10%] px-4 py-4 text-left font-bold text-[13px] uppercase tracking-wider">Ticket ID</th>
                <th className="w-[18%] px-4 py-4 text-left font-bold text-[13px] uppercase tracking-wider hidden md:table-cell">Requester</th>
                <th className="w-[28%] px-4 py-4 text-left font-bold text-[13px] uppercase tracking-wider">Subject</th>
                <th className="w-[17%] px-4 py-4 text-left font-bold text-[13px] uppercase tracking-wider hidden lg:table-cell">Technician</th>
                <th className="w-[12%] px-4 py-4 text-left font-bold text-[13px] uppercase tracking-wider hidden sm:table-cell whitespace-nowrap">Created Date</th>
                <th className="w-[10%] px-4 py-4 text-center font-bold text-[13px] uppercase tracking-wider">Status</th>
                <th className="w-[10%] px-4 py-4 text-center font-bold text-[13px] uppercase tracking-wider actions-column">Action</th>
              </tr>
            </thead> 
            <tbody className="divide-y divide-slate-200">
              {/* මෙතනදීත් filteredTickets භාවිතා කරනවා */}
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} style={getRowStyle(ticket.status)} className="transition-colors border-b border-slate-200">
                  <td className="px-4 py-4 font-bold text-slate-800 text-left align-top text-sm">{ticket.ticketId}</td>
                  <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-left align-top whitespace-nowrap overflow-hidden text-ellipsis text-sm font-normal">{ticket.requester || '-'}</td>
                  <td className="px-4 py-4 text-slate-700 text-left align-top">
                    <div className="break-words whitespace-normal leading-normal font-normal text-sm">{ticket.subject || '-'}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 hidden lg:table-cell text-left align-top text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">{ticket.assignedTechnician || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 hidden sm:table-cell text-left align-top text-sm leading-relaxed">
                    {ticket.dateCreated ? (
                      <div className="flex flex-col font-normal">
                        <span className="text-slate-800">{new Date(ticket.dateCreated).toLocaleDateString('en-GB')}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(ticket.dateCreated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-center align-top">
                    <div className="flex justify-center">
                      <span className={getStatusBadge(ticket.status)}>{ticket.status === 'Open' ? 'Assigned' : ticket.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top actions-column text-center">
                    <div className="flex gap-2 justify-center items-center">
                       <button onClick={() => onView(ticket)} title="View" className="hover:scale-125 transition-transform text-base opacity-70 hover:opacity-100">👁️</button>
                       <button onClick={() => onEdit(ticket)} title="Edit" className="hover:scale-125 transition-transform text-base opacity-70 hover:opacity-100">✏️</button>
                       {/* notes button; same handler as edit but with different icon */}
                       <button onClick={() => onEdit(ticket)} title={ticket.notes || 'Add note'} className={`relative hover:scale-125 transition-transform text-base ${ticket.notes ? 'text-blue-600' : 'text-gray-400'} opacity-70 hover:opacity-100`}>📝{ticket.notes && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">1</span>}</button>
                       <button onClick={() => onDelete(ticket)} title="Delete" className="hover:scale-125 transition-transform text-red-600 text-base opacity-70 hover:opacity-100">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800">No tickets found for today.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketTable;