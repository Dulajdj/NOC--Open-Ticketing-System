import React, { useState } from 'react';
import axios from 'axios';

const AddTicketForm = ({ onTicketAdded }) => {
  const [formData, setFormData] = useState({
    ticketId: '',
    requester: '',
    bankName: '', // මෙය අනිවාර්යයෙන්ම database එකට යා යුතුය
    subject: '',
    notes: '',
    createdDate: '',
    status: 'Assigned',
    assignedTechnician: '',
    dueDate: '',
    resolvedDate: '',
    sla: '',
    fitOperator: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  const dataToSubmit = { ...formData };

  // Remove empty date strings so Mongoose doesn't try to parse them
  ['createdDate', 'dueDate', 'resolvedDate'].forEach(key => {
    if (dataToSubmit[key] === "") {
      delete dataToSubmit[key];
    }
  });

    try {
      // Backend එකට දත්ත යැවීම
      await axios.post('http://localhost:5000/api/tickets', formData);
      setMessage({ type: 'success', text: '✅ Ticket created successfully!' });
      
      // Form එක Reset කිරීම
      setFormData({
        ticketId: '', requester: '', bankName: '', subject: '', notes: '',
        createdDate: '', status: 'Assigned', assignedTechnician: '',
        dueDate: '', resolvedDate: '', sla: '', fitOperator: ''
      });
      
      onTicketAdded(); // Dashboard එක refresh කිරීමට
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Create ticket error:', err);
      const serverMsg = err?.response?.data?.message || 'Failed to create ticket.';
      setMessage({ type: 'error', text: `❌ ${serverMsg}` });
    } finally {
      setLoading(false);
    }
  };

  // පොදු Styling classes
  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all text-gray-700 dark:text-gray-200 shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-600 mb-1 flex items-center gap-2";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
      <form onSubmit={handleSubmit} className="p-8 space-y-6 text-slate-800 dark:text-slate-200">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        {/* Row 1: Requester & Bank Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClass}><span>👤</span> Requester</label>
            <input name="requester" placeholder="Requester name" value={formData.requester} onChange={handleChange} className={inputClass} required />
          </div>
          <div className="space-y-1">
            <label className={labelClass}><span>🏦</span> Select Bank</label>
            <select name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} required>
              <option value="">-- Select Bank --</option>
              <option value="People's Bank">People's Bank</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="Other">Other / General</option>
            </select>
          </div>
        </div>

        {/* Row 2: Ticket ID, Subject & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className={labelClass}><span>🎟️</span> Ticket ID</label>
            <input name="ticketId" placeholder="TKT-2026-001" value={formData.ticketId} onChange={handleChange} className={inputClass} required />
          </div>
          <div className="space-y-1">
            <label className={labelClass}><span>📌</span> Subject (optional)</label>
            <input name="subject" placeholder="Brief subject" value={formData.subject} onChange={handleChange} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}><span>📝</span> Note (optional)</label>
            <textarea name="notes" placeholder="Additional comments" value={formData.notes} onChange={handleChange} className={inputClass} rows={2} />
          </div>
        </div>

        {/* Row 3: Status & Technician */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClass}><span>✅</span> Current Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}><span>🛠️</span> Assigned Technician</label>
            <input name="assignedTechnician" placeholder="Technician name" value={formData.assignedTechnician} onChange={handleChange} className={inputClass} required />
          </div>
        </div>

        {/* Row 4: Dates & SLA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   <div className="space-y-1">
    <label className={labelClass}><span>📅</span> Created Date</label>
    {/* datetime-local මඟින් දිනය සහ වේලාව තෝරාගත හැක */}
    <input type="datetime-local" name="createdDate" value={formData.createdDate} onChange={handleChange} className={inputClass} />
  </div>
  <div className="space-y-1">
    <label className={labelClass}><span>⏰</span> Due Date</label>
    <input type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClass} />
  </div>
  <div className="space-y-1">
    <label className={labelClass}><span>🏁</span> Resolved Date</label>
    <input type="datetime-local" name="resolvedDate" value={formData.resolvedDate} onChange={handleChange} className={inputClass} />
  </div>
</div>

        {/* Footer Row: FIT Operator & Submit Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-1">
            <label className={labelClass}><span>👨‍💻</span> FIT Operator</label>
            <select name="fitOperator" value={formData.fitOperator} onChange={handleChange} className={inputClass}>
              <option value="">Select operator</option>
              <option>Navod</option><option>Viraj</option><option>Savinda</option><option>Divanka</option>
              <option>Isuka</option><option>Tharindi</option><option>Hansa</option><option>Tharushi</option>
              <option>Nusri</option><option>Dilina</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg text-white ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95'}`}>
            {loading ? 'Creating Ticket...' : '✨ Create Support Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTicketForm;