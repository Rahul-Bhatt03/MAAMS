import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  status: { 
    type: String, 
    required: true,
    enum: ['Ongoing', 'Completed', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  funding_source: { type: String },
  principal_investigator_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true
  },
  department_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department',
    required: true
  },
  attachments: [{ 
    name: { type: String },
    url: { type: String },
    type: { type: String },
    uploaded_at: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Pre-find middleware to filter out deleted records by default
researchSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Research = mongoose.model('Research', researchSchema);
export default Research;