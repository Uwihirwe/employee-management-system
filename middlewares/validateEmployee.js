const Joi = require('joi');

// Define the schema for employee validation
const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  position: Joi.string().min(2).max(50).required(),
  department: Joi.string().min(2).max(50).required(),
  salary: Joi.number().min(0).required(),
  hireDate: Joi.date().iso(),
  isActive: Joi.boolean().default(true)
});

// Middleware to validate request body
function validateEmployee(req, res, next) {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = validateEmployee;
