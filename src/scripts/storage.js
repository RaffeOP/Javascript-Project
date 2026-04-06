/**
 * Storage Protocol
 * Unified wrapper for window.localStorage with validation and versioning.
 */

const STORAGE_PREFIX = 'gsd_dashboard_';

export const StorageService = {
    /**
     * Get data by key
     * @param {string} key
     * @returns {any}
     */
    get: function(key) {
        try {
            const data = localStorage.getItem(STORAGE_PREFIX + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Storage Error (get ${key}):`, error);
            return null;
        }
    },

    /**
     * Save data by key
     * @param {string} key
     * @param {any} value
     */
    save: function(key, value) {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage Error (save ${key}):`, error);
            return false;
        }
    },

    /**
     * Clear all dashboard data
     */
    clearAll: function() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
};
