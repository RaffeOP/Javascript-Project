/**
 * Task Manager Agent
 * Handles CRUD and UI for the task protocol.
 */

import { StorageService } from './storage.js';

const STORAGE_KEY = 'tasks';

export const TaskService = {
    tasks: [],

    /**
     * Start the task system
     */
    init: function() {
        this.tasks = StorageService.get(STORAGE_KEY) || [
            { id: 1, text: 'Plan Phase 4 Roadmap', priority: 'high', completed: false },
            { id: 2, text: 'Deploy Dashboard Prototype', priority: 'medium', completed: true },
            { id: 3, text: 'Review Task Protocols', priority: 'low', completed: false }
        ];
        this.render();
    },

    /**
     * Create a new task
     */
    add: function(text, priority = 'low') {
        const newTask = {
            id: Date.now(),
            text,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(newTask);
        this.save();
        this.render();
    },

    /**
     * Toggle task status
     */
    toggle: function(id) {
        this.tasks = this.tasks.map(t => 
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        this.save();
        this.render();
    },

    /**
     * Remove task from registry
     */
    remove: function(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },

    /**
     * Persist to storage
     */
    save: function() {
        StorageService.save(STORAGE_KEY, this.tasks);
        if (window.syncDashboard) window.syncDashboard();
    },

    /**
     * Build the UI entries
     */
    render: function() {
        const container = document.getElementById('widget-2');
        if (!container) return;

        const taskList = container.querySelector('.task-list') || document.createElement('div');
        taskList.className = 'task-list';
        
        taskList.innerHTML = this.tasks.length > 0 
            ? this.tasks.map(t => `
                <div class="task-item ${t.completed ? 'completed' : ''} priority-${t.priority}" data-id="${t.id}">
                    <div class="check" onclick="window.TaskServiceBridge.toggle(${t.id})"></div>
                    <span class="text">${t.text}</span>
                    <button class="remove" onclick="window.TaskServiceBridge.remove(${t.id})">×</button>
                </div>
            `).join('')
            : '<p class="empty-state">No active protocols.</p>';

        // Set content if not already added
        const contentArea = container.querySelector('.card-content');
        if (!contentArea.querySelector('.task-list')) {
            contentArea.innerHTML = `
                <h3>Task Protocol</h3>
                <div class="task-input-group">
                    <input type="text" placeholder="Add protocol..." id="new-task-input">
                    <button id="add-task-btn">+</button>
                </div>
                <div class="task-list"></div>
            `;
            
            // Add listeners
            const input = document.getElementById('new-task-input');
            const btn = document.getElementById('add-task-btn');
            
            btn.onclick = () => {
                if (input.value.trim()) {
                    this.add(input.value.trim(), 'medium');
                    input.value = '';
                }
            };
            
            input.onkeypress = (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    this.add(input.value.trim(), 'medium');
                    input.value = '';
                }
            };
        }

        contentArea.querySelector('.task-list').innerHTML = taskList.innerHTML;
        
        // Expose bridge for inline onclick (simplified for vanilla JS)
        window.TaskServiceBridge = {
            toggle: (id) => this.toggle(id),
            remove: (id) => this.remove(id)
        };
    }
};
