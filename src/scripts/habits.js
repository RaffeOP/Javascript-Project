/**
 * Habit Matrix Agent
 * Handles streak tracking and mini-heatmap rendering.
 */

import { StorageService } from './storage.js';

const STORAGE_KEY = 'habits';

export const HabitService = {
    habits: [],

    init: function() {
        this.habits = StorageService.get(STORAGE_KEY) || [
            { id: 1, name: 'Deep Work (2hr)', done: [] },
            { id: 2, name: 'Hydration Protocol', done: [] }
        ];
        this.render();
    },

    add: function(name) {
        this.habits.push({ id: Date.now(), name, done: [] });
        this.save();
        this.render();
    },

    toggleDate: function(id, dateStr) {
        this.habits = this.habits.map(h => {
            if (h.id === id) {
                const done = h.done.includes(dateStr) 
                    ? h.done.filter(d => d !== dateStr) 
                    : [...h.done, dateStr];
                return { ...h, done };
            }
            return h;
        });
        this.save();
        this.render();
    },

    calculateStreak: function(doneDates) {
        if (!doneDates.length) return 0;
        const sorted = [...new Set(doneDates)].sort((a,b) => new Date(b) - new Date(a));
        let streak = 0;
        let current = new Date();
        current.setHours(0,0,0,0);

        for (let i = 0; i < sorted.length; i++) {
            const date = new Date(sorted[i]);
            date.setHours(0,0,0,0);
            
            const diff = (current - date) / (1000 * 60 * 60 * 24);
            if (diff === 0 || diff === 1) {
                streak++;
                current = date;
            } else if (diff > 1 && i === 0) {
                // Streak broken if latest isn't today/yesterday
                return 0;
            } else {
                break;
            }
        }
        return streak;
    },

    save: function() {
        StorageService.save(STORAGE_KEY, this.habits);
    },

    render: function() {
        const container = document.getElementById('widget-5');
        if (!container) return;

        const contentArea = container.querySelector('.card-content');
        contentArea.innerHTML = `
            <h3>Ritual Matrix</h3>
            <div class="habit-input-group">
                <input type="text" placeholder="Protocol name..." id="habit-name">
                <button id="add-habit-btn">+</button>
            </div>
            <div class="habit-list">
                ${this.habits.map(h => `
                    <div class="habit-item">
                        <div class="habit-info">
                            <span class="name">${h.name}</span>
                            <span class="streak-badge">${this.calculateStreak(h.done)} DAY STREAK</span>
                        </div>
                        <div class="streak-mini">
                            ${this.getMiniHeatmap(h.id, h.done)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('add-habit-btn').onclick = () => {
            const name = document.getElementById('habit-name').value;
            if (name) {
                this.add(name);
                document.getElementById('habit-name').value = '';
            }
        };

        window.HabitBridge = { toggle: (id, date) => this.toggleDate(id, date) };
    },

    getMiniHeatmap: function(id, doneDates) {
        let html = '';
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const isDone = doneDates.includes(dateStr);
            const isToday = i === 0;
            html += `<span class="heatmap-dot ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}" 
                           onclick="window.HabitBridge.toggle(${id}, '${dateStr}')"
                           title="${dateStr}"></span>`;
        }
        return html;
    }
};
