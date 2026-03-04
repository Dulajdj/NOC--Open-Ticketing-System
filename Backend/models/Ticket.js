const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bankName: { type: String },
  ticketId: { type: String, required: true, unique: true },
  issueDescription: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['Assigned', 'In Progress', 'Closed', 'Resolved'], 
    default: 'Assigned' 
  },
  assignedTechnician: { type: String, required: true },
  requester: { type: String },
  subject: { type: String },
  createdDate: { type: Date }, // මෙයට පරණ දිනය සහ වේලාව ලැබේ
  dueDate: { type: Date },
  resolvedDate: { type: Date },
  sla: { type: String },
  fitOperator: { type: String },
  notes: { type: String, default: '' }, // free-text note per ticket
  dateCreated: { type: Date, default: Date.now } // පද්ධතියේ සටහන් වන දිනය
});

// "next is not a function" වැළැක්වීමට නිවැරදි Middleware එක
ticketSchema.pre('save', function(next) {
  // ඔබ විසින් 'createdDate' ලබා දී ඇත්නම්, එය 'dateCreated' ලෙසද සකසයි
  if (this.createdDate) {
    this.dateCreated = this.createdDate;
  }
  else if (!this.dateCreated) {
    this.dateCreated = new Date();
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);