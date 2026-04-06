/**
 * Location Protocol
 * Handles navigator.geolocation with high-accuracy and fallbacks.
 */

export const LocationService = {
    /**
     * Get user coordinates
     * @returns {Promise<{lat: number, lon: number}>}
     */
    getCurrentPosition: function() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    /**
     * Fallback coordinates (London)
     */
    getFallbackPosition: function() {
        return { lat: 51.5074, lon: -0.1278 };
    }
};
