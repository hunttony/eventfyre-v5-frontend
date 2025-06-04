/**
 * @typedef {Object} User
 * @property {string} id - The user's unique identifier
 * @property {string} name - The user's full name
 * @property {string} email - The user's email address
 * @property {'vendor'|'organizer'|'admin'} role - The user's role
 * @property {string} [phone] - The user's phone number
 * @property {string} [company] - The user's company name
 * @property {string} [bio] - A short bio about the user
 * @property {string} [address] - The user's street address
 * @property {string} [city] - The user's city
 * @property {string} [state] - The user's state/province
 * @property {string} [zipCode] - The user's ZIP/postal code
 * @property {string} [website] - The user's website URL
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} currentUser - The currently authenticated user
 * @property {boolean} loading - Whether auth state is being loaded
 * @property {string|null} token - The current auth token
 * @property {Function} login - Function to log in a user
 * @property {Function} logout - Function to log out the current user
 * @property {Function} updateUser - Function to update user data
 */

// This file provides type information for JavaScript files using JSDoc comments
