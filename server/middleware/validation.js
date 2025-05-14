import { validateEmail, validatePassword } from './authValidation.js';

export const validateRegistrationData = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  const errors = [];

  if (!firstName?.trim()) {
    errors.push('First name is required');
  }
  if (!lastName?.trim()) {
    errors.push('Last name is required');
  }
  if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

export const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: ['Email and password are required']
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: ['Invalid email format']
    });
  }

  next();
};