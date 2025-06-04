/**
 * Validation utility for form fields
 */

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Simple email validation
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, // Basic phone number
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/, // Basic URL
  zipCode: /^\d{5}(-\d{4})?$/, // US ZIP code format
};

// Common validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  url: 'Please enter a valid URL',
  zipCode: 'Please enter a valid ZIP code',
  minLength: (length) => `Must be at least ${length} characters`,
  maxLength: (length) => `Must be ${length} characters or less`,
  match: (fieldName) => `Must match ${fieldName}`,
};

/**
 * Validates a value against a set of rules
 * @param {*} value - The value to validate
 * @param {Object} rules - Validation rules
 * @returns {string|null} - Error message or null if valid
 */
export const validate = (value, rules = {}) => {
  if (rules.required && (value === '' || value === null || value === undefined)) {
    return messages.required;
  }

  if (value === '' || value === null || value === undefined) {
    return null; // Skip further validation if value is empty and not required
  }

  if (rules.email && !patterns.email.test(String(value).toLowerCase())) {
    return messages.email;
  }

  if (rules.phone && !patterns.phone.test(value)) {
    return messages.phone;
  }

  if (rules.password && !patterns.password.test(value)) {
    return messages.password;
  }

  if (rules.url && !patterns.url.test(value)) {
    return messages.url;
  }

  if (rules.zipCode && !patterns.zipCode.test(value)) {
    return messages.zipCode;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return messages.minLength(rules.minLength);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return messages.maxLength(rules.maxLength);
  }

  if (rules.match && value !== rules.match.value) {
    return messages.match(rules.match.fieldName);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  if (rules.validate && typeof rules.validate === 'function') {
    const customError = rules.validate(value);
    if (customError) return customError;
  }

  return null; // No errors
};

/**
 * Validates all fields in a form data object
 * @param {Object} formData - Form data object { fieldName: value }
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} - Object with error messages for each field
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const fieldRules = validationRules[field];
    const error = validate(value, fieldRules);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

/**
 * Custom validation rules
 */
export const validators = {
  // Check if a date is in the future
  futureDate: (value) => {
    if (!value) return null;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      return 'Date must be in the future';
    }
    return null;
  },
  
  // Check if end date is after start date
  afterStartDate: (endValue, startValue) => {
    if (!endValue || !startValue) return null;
    
    const endDate = new Date(endValue);
    const startDate = new Date(startValue);
    
    if (endDate <= startDate) {
      return 'End date must be after start date';
    }
    return null;
  },
  
  // Check if value is a number within a range
  numberRange: (value, min, max) => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a number';
    if (num < min) return `Must be at least ${min}`;
    if (num > max) return `Must be ${max} or less`;
    return null;
  },
};

/**
 * Creates a form validator with the given rules
 * @param {Object} rules - Validation rules for each field
 * @returns {Function} - A function that validates form data
 */
export const createValidator = (rules) => {
  return (formData) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const fieldRules = rules[field];
      const error = validate(value, fieldRules);
      
      if (error) {
        errors[field] = error;
      }
    });
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  };
};

/**
 * Example usage:
 * 
 * const validationRules = {
 *   email: {
 *     required: true,
 *     email: true,
 *   },
 *   password: {
 *     required: true,
 *     minLength: 8,
 *   },
 *   confirmPassword: {
 *     required: true,
 *     match: {
 *       value: formData.password,
 *       fieldName: 'password',
 *     },
 *   },
 *   startDate: {
 *     required: true,
 *     validate: (value) => validators.futureDate(value),
 *   },
 *   endDate: {
 *     required: true,
 *     validate: (value) => validators.afterStartDate(value, formData.startDate),
 *   },
 * };
 * 
 * // In a form component:
 * const handleSubmit = (e) => {
 *   e.preventDefault();
 *   
 *   const { errors, isValid } = validateForm(formData, validationRules);
 *   
 *   if (!isValid) {
 *     setFormErrors(errors);
 *     return;
 *   }
 *   
 *   // Submit form...
 * };
 */
