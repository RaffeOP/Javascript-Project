/**
 * Weather Service Agent
 * Fetches and processes live weather telemetry.
 */

const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

export const WeatherService = {
    apiKey: null, // User can provide this in settings later

    /**
     * Fetch weather for given coordinates
     * @param {number} lat
     * @param {number} lon
     * @returns {Promise<object>}
     */
    fetchWeather: async function(lat, lon) {
        if (!this.apiKey) {
            console.warn("Weather API Key missing. Using demo mode.");
            return this.getDemoData();
        }

        try {
            const url = `${WEATHER_API_BASE}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Weather fetch failed");
            return await response.json();
        } catch (error) {
            console.error(error);
            return this.getDemoData();
        }
    },

    /**
     * Update the dashboard's visual theme based on weather
     * @param {string} condition - e.g., 'Clear', 'Rain', 'Clouds'
     */
    updateAtmosphere: function(condition) {
        const root = document.documentElement;
        
        const themes = {
            'Clear': { accent1: 'hsl(45, 100%, 60%)', accent2: 'hsl(190, 100%, 70%)' }, // Golden Sun & Sky
            'Clouds': { accent1: 'hsl(210, 15%, 40%)', accent2: 'hsl(250, 15%, 50%)' }, // Silver Clouds
            'Rain': { accent1: 'hsl(220, 70%, 40%)', accent2: 'hsl(200, 70%, 30%)' },   // Deep Indigo Rain
            'Drizzle': { accent1: 'hsl(200, 40%, 60%)', accent2: 'hsl(180, 40%, 50%)' },
            'Thunderstorm': { accent1: 'hsl(280, 100%, 60%)', accent2: 'hsl(10, 100%, 60%)' }, // Purple & Lightning
            'Snow': { accent1: 'hsl(190, 80%, 90%)', accent2: 'hsl(210, 80%, 80%)' },   // Frosty White
            'Default': { accent1: 'hsl(190, 70%, 60%)', accent2: 'hsl(280, 70%, 60%)' } // Original Neon
        };

        const theme = themes[condition] || themes.Default;
        
        root.style.setProperty('--clr-accent-1', theme.accent1);
        root.style.setProperty('--clr-accent-2', theme.accent2);
    },

    /**
     * Simulated High-Fidelity Data
     */
    getDemoData: function() {
        return {
            name: "Vellore",
            main: { temp: 28 },
            weather: [{ main: "Clear", description: "Clear Sky" }],
            dt: Date.now() / 1000
        };
    }
};
