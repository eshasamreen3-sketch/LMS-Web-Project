/**
 * Utility functions for local storage management and authentication
 */

const STORAGE_KEY = 'lms_current_user';

const utils = {
    // Save user to local storage
    saveUserToLocal: (user) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    },

    // Get user from local storage
    getUserFromLocal: () => {
        const userStr = localStorage.getItem(STORAGE_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Remove user from local storage (Logout)
    clearUser: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem(STORAGE_KEY);
    },

    // Format currency (not strictly needed but good for course prices if added later)
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Export to global scope for plain JS
window.utils = utils;
