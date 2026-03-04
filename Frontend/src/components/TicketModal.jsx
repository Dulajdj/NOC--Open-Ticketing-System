import React, { useState, useEffect } from 'react';

const TicketModal = ({ ticket, onClose, onUpdate, onDelete, initialEditing = false }) => {
  const [editing, setEditing] = useState(initialEditing);
  const [form, setForm] = useState({
    ticketId: ticket.ticketId || '',
    requester: ticket.requester || '',
    subject: ticket.subject || '',
    notes: ticket.notes || '',
    createdDate: ticket.createdDate || ticket.dateCreated || '',
    dueDate: ticket.dueDate || '',
    resolvedDate: ticket.resolvedDate || '',
    sla: ticket.sla || '',
    fitOperator: ticket.fitOperator || '',
    status: ticket.status || 'Open',
    assignedTechnician: ticket.assignedTechnician || ''
  });

  // keep form synced if ticket changes (e.g., after update)
  useEffect(() => {
    setForm({
      ticketId: ticket.ticketId || '',
      requester: ticket.requester || '',
      subject: ticket.subject || '',
      notes: ticket.notes || '',
      createdDate: ticket.createdDate || ticket.dateCreated || '',
      dueDate: ticket.dueDate || '',
      resolvedDate: ticket.resolvedDate || '',
      sla: ticket.sla || '',
      fitOperator: ticket.fitOperator || '',
      status: ticket.status || 'Open',
      assignedTechnician: ticket.assignedTechnician || ''
    });
    setEditing(initialEditing);
  }, [ticket, initialEditing]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
  setLoading(true);
  try {
    // 1. Update function එක ක්‍රියාත්මක කරන්න
    await onUpdate(ticket._id, form);
    
    // 2. සාර්ථක පණිවිඩයක් පෙන්වන්න
    setMessage({ type: 'success', text: 'Ticket updated successfully!' });
    
    // 3. තත්පරයකට පසු Modal එක වසා දමන්න (එවිට user ට update වූ බව පෙනේ)
    setTimeout(() => {
      onClose();
    }, 1000);

  } catch (err) {
    setMessage({ type: 'error', text: err?.message || 'Failed to update' });
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    setLoading(true);
    try {
      await onDelete(ticket._id);
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Failed to delete' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Ticket Details</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditing(!editing); setForm({ ...form, ticketId: ticket.ticketId }); }} className="px-3 py-2 rounded-lg bg-yellow-400 text-white font-semibold">{editing ? 'Cancel' : 'Edit'}</button>
            <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800">Close</button>
          </div>
        </div>

        <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
          {message && (
            <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{message.text}</div>
          )}

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              <div>
                <p className="text-sm text-gray-500">Ticket ID</p>
                <p className="font-semibold">{ticket.ticketId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Requester</p>
                <p className="font-semibold">{ticket.requester || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-semibold">{ticket.subject || '-'}</p>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-semibold whitespace-pre-wrap">{ticket.notes || '-'}</p>
                {ticket.notes && !editing && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Remove note?')) return;
                      try {
                        await onUpdate(ticket._id, { notes: '' });
                        setMessage({ type: 'success', text: 'Note deleted' });
                      } catch (err) {
                        setMessage({ type: 'error', text: err?.message || 'Failed to delete note' });
                      }
                    }}
                    className="mt-2 text-red-600 text-xs underline"
                  >
                    Delete note
                  </button>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{ticket.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Technician</p>
                <p className="font-semibold">{ticket.assignedTechnician}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-semibold">{ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Resolved Date</p>
                <p className="font-semibold">{ticket.resolvedDate ? new Date(ticket.resolvedDate).toLocaleString() : '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">SLA</p>
                <p className="font-semibold">{ticket.sla || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">FIT Operator</p>
                <p className="font-semibold">{ticket.fitOperator || '-'}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Date Created</p>
                <p className="font-semibold">{new Date(ticket.dateCreated).toLocaleString()}</p>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold">Delete</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                <div>
                  <label className="block text-sm text-gray-600">Ticket ID</label>
                  <input name="ticketId" value={form.ticketId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Requester</label>
                  <input name="requester" value={form.requester} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div className="md:col-span-2 relative">
                  <label className="block text-sm text-gray-600">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg resize-none" />
                  {form.notes && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, notes: '' })}
                      className="absolute top-1 right-2 text-red-500 text-sm"
                      title="Clear note"
                    >
                      ✖️
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Created Date</label>
                  <input type="datetime-local" name="createdDate" value={form.createdDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Due Date</label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Resolved Date</label>
                  <input type="date" name="resolvedDate" value={form.resolvedDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">SLA</label>
                  <select name="sla" value={form.sla} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select SLA status (optional)</option>
                    <option value="SLA Violated">SLA Violated</option>
                    <option value="SLA Not Violated">SLA Not Violated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">FIT Operator</label>
                  <input name="fitOperator" value={form.fitOperator} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Technician</label>
                  <input name="assignedTechnician" value={form.assignedTechnician} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">{loading ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
