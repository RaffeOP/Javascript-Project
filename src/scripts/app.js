/**
 * Ultimate Personal Productivity Dashboard
 * Core App Controller - Phase 1 Foundation
 */

import { LocationService } from './location.js';
import { WeatherService } from './weather.js';
import { TaskService } from './tasks.js';
import { NoteService } from './notes.js';
import { ExpenseService } from './expenses.js';
import { HabitService } from './habits.js';
import { PomodoroService } from './pomodoro.js';

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    init3DTilt();
    initRevealAnimations();
    initWeather();
    TaskService.init();
    NoteService.init();
    ExpenseService.init();
    HabitService.init();
    PomodoroService.init();
    
    // Initial Sync
    setTimeout(syncStatus, 1500); 
});

/**
 * Update the main dashboard clock
 */
function initClock() {
    const timeDisplay = document.getElementById('main-time');
    
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
    }

    setInterval(updateTime, 1000);
    updateTime();
}

/**
 * Apply dynamic 3D tilt based on mouse position
 */
function init3DTilt() {
    const container = document.querySelector('.dashboard-container');
    const desktop = document.querySelector('.floating-desktop');

    if (!container || !desktop) return;

    container.addEventListener('mousemove', (e) => {
        const { width, height } = container.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate rotation degrees based on mouse distance from center
        // Center = 0deg, Edges = max 4deg
        const rotationY = ((mouseX - width / 2) / (width / 2)) * 4;
        const rotationX = ((height / 2 - mouseY) / (height / 2)) * 4;

        desktop.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    });

    // Reset on mouse leave
    container.addEventListener('mouseleave', () => {
        desktop.style.transform = `rotateX(2deg) rotateY(0deg)`;
    });
}

/**
 * Staggered reveal for glass widgets
 */
function initRevealAnimations() {
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateZ(-50px) translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateZ(0) translateY(0)';
        }, 300 + (index * 150));
    });
}

/**
 * Initialize weather telemetry
 */
async function initWeather() {
    const weatherWidget = document.getElementById('widget-1');
    if (!weatherWidget) return;

    try {
        const coords = await LocationService.getCurrentPosition().catch(() => LocationService.getFallbackPosition());
        const data = await WeatherService.fetchWeather(coords.lat, coords.lon);
        
        if (data && data.weather && data.weather[0]) {
            const condition = data.weather[0].main;
            const temp = Math.round(data.main.temp);
            const city = data.name;

            // Update UI
            weatherWidget.querySelector('.card-content').innerHTML = `
                <h3>${city}</h3>
                <div class="weather-data">
                    <p class="temp">${temp}°C</p>
                    <p class="condition">${data.weather[0].description}</p>
                </div>
            `;
            
            // Sync Atmosphere
            WeatherService.updateAtmosphere(condition);
        }
    } catch (error) {
        console.error("Weather Initialization Error:", error);
    }
}

/**
 * Sync overall dashboard health to the header
 */
function syncStatus() {
    const statusBadge = document.querySelector('.status-badge');
    if (!statusBadge) return;

    const activeTasks = TaskService.tasks.filter(t => !t.completed).length;
    const expenseCount = ExpenseService.transactions.length;
    
    statusBadge.innerHTML = `
        <span class="pulse"></span> 
        System Live: ${activeTasks} Protocols Active | ${expenseCount} Ledger Entries
    `;
}

// Global exposure for widget hooks
window.syncDashboard = syncStatus;
