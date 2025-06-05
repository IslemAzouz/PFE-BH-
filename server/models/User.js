const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  RIB:      { type: String, required: true, validate: { validator: function(v) { return /^\d{20}$/.test(v); }, message: 'RIB must be exactly 20 digits.' } },
  CIN:      { type: String, required: true, unique: true },
  admin:    { type: Number, default: 0 },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
