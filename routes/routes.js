const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Create a new Employee
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { name, email, position, department, salary } = req.body;
    
    // Check if employee with same email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Create new employee
    const newEmployee = new Employee({
      name,
      email,
      position,
      department,
      salary
    });

      const savedEmployee = await newEmployee.save();
    res.status(201).json({ 
      message: 'Employee created successfully',
      employee: savedEmployee 
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error creating employee', 
      error: err.message 
    });
  }
});

// Get all Employees
router.get('/', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // Filtering options
    const filter = {};
if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.position) {
      filter.position = req.query.position;
    }

    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order || 'desc';

    const employees = await Employee.find(filter)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit)
      .skip(skipIndex);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmployees: total
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error retrieving employees', 
      error: err.message 
    });
  }
});

// Get a Single Employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error retrieving employee', 
      error: err.message 
    });
  }
});

// Update an Employee
router.put('/:id', async (req, res) => {
  try {
    // Prevent updating email
    if (req.body.email) {
      return res.status(400).json({ message: 'Email cannot be updated' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validations on update
      }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error updating employee', 
      error: err.message 
    });
  }
});

// Delete an Employee
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ 
      message: 'Employee successfully deleted',
      deletedEmployee 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting employee', 
      error: err.message 
    });
  }
});



module.exports = router;