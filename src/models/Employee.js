const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    salary: { type: Number, required: true, min: 0 },
    date_of_joining: { type: Date, required: true },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    // Owner: the user who created this employee
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// The same user can't add two employees with the same email
employeeSchema.index({ user: 1, email: 1 }, { unique: true });

employeeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);