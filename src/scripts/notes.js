/**
 * Notes Grid Agent
 * Handles CRUD and UI for the notes protocol.
 */

import { StorageService } from './storage.js';

const STORAGE_KEY = 'notes';

export const NoteService = {
    notes: [],

    /**
     * Start the notes system
     */
    init: function() {
        this.notes = StorageService.get(STORAGE_KEY) || [
            { id: 1, content: 'Research 2025 Vanilla Stacks', color: 'blue' },
            { id: 2, content: 'Phase 5: Global Sync logic', color: 'purple' }
        ];
        this.render();
    },

    /**
     * Create a new note
     */
    add: function(content = '') {
        const newNote = {
            id: Date.now(),
            content,
            color: 'default',
            updatedAt: new Date().toISOString()
        };
        this.notes.push(newNote);
        this.save();
        this.render();
    },

    /**
     * Save to storage
     */
    save: function() {
        StorageService.save(STORAGE_KEY, this.notes);
    },

    /**
     * Throttled auto-save for editor
     */
    update: function(id, content) {
        this.notes = this.notes.map(n => 
            n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n
        );
        this.save();
    },

    /**
     * Delete note
     */
    remove: function(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.save();
        this.render();
    },

    /**
     * Build the UI entries
     */
    render: function() {
        const container = document.getElementById('widget-3');
        if (!container) return;

        const contentArea = container.querySelector('.card-content');
        
        contentArea.innerHTML = `
            <div class="notes-header">
                <h3>Notes Matrix</h3>
                <button id="add-note-btn">+</button>
            </div>
            <div class="notes-grid">
                ${this.notes.map(n => `
                    <div class="note-item" data-id="${n.id}">
                        <textarea 
                            oninput="window.NoteServiceBridge.update(${n.id}, this.value)" 
                            placeholder="Type protocol content...">${n.content}</textarea>
                        <button class="remove" onclick="window.NoteServiceBridge.remove(${n.id})">×</button>
                    </div>
                `).join('')}
                ${this.notes.length === 0 ? '<p class="empty-state">No protocols recorded.</p>' : ''}
            </div>
        `;
        
        // Listeners
        const btn = document.getElementById('add-note-btn');
        if (btn) btn.onclick = () => this.add();
        
        // Expose bridge
        window.NoteServiceBridge = {
            update: (id, val) => this.update(id, val),
            remove: (id) => this.remove(id)
        };
    }
};
