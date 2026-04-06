/**
 * Expense Tracker Agent
 * Handles financial logging and auto-balance calculations.
 */

import { StorageService } from './storage.js';

const STORAGE_KEY = 'expenses';

export const ExpenseService = {
    transactions: [],

    /**
     * Start the expense tracker
     */
    init: function() {
        this.transactions = StorageService.get(STORAGE_KEY) || [
            { id: 1, amount: 50, type: 'out', category: 'Computing', date: '2026-04-06' },
            { id: 2, amount: 1200, type: 'in', category: 'Salary', date: '2026-04-01' }
        ];
        this.render();
    },

    /**
     * Add new transaction
     */
    add: function(amount, type, category = 'General') {
        const transaction = {
            id: Date.now(),
            amount: parseFloat(amount),
            type,
            category,
            date: new Date().toISOString().split('T')[0]
        };
        this.transactions.unshift(transaction);
        this.save();
        this.render();
    },

    /**
     * Delete transaction
     */
    remove: function(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();
        this.render();
    },

    /**
     * Calculate net balance
     */
    getBalance: function() {
        return this.transactions.reduce((acc, t) => 
            t.type === 'in' ? acc + t.amount : acc - t.amount, 0
        );
    },

    /**
     * Persist to storage
     */
    save: function() {
        StorageService.save(STORAGE_KEY, this.transactions);
        if (window.syncDashboard) window.syncDashboard();
    },

    /**
     * Build the UI
     */
    render: function() {
        const container = document.getElementById('widget-4');
        if (!container) return;

        const balance = this.getBalance();
        const contentArea = container.querySelector('.card-content');
        
        contentArea.innerHTML = `
            <h3>Financial Ledger</h3>
            <div class="balance-total">
                <span class="label">Total Balance</span>
                <span class="value ${balance < 0 ? 'negative' : 'positive'}">$${balance.toFixed(2)}</span>
            </div>
            <div class="expense-input-group">
                <input type="number" step="0.01" placeholder="Amount..." id="exp-amount">
                <select id="exp-type">
                    <option value="out">Out</option>
                    <option value="in">In</option>
                </select>
                <button id="add-exp-btn">+</button>
            </div>
            <div class="ledger-list">
                ${this.transactions.slice(0, 5).map(t => `
                    <div class="ledger-item type-${t.type}" onclick="window.ExpenseServiceBridge.remove(${t.id})">
                        <span class="category">${t.category}</span>
                        <span class="amount">${t.type === 'in' ? '+' : '-'}$${t.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Listeners
        const btn = document.getElementById('add-exp-btn');
        if (btn) btn.onclick = () => {
            const amount = document.getElementById('exp-amount').value;
            const type = document.getElementById('exp-type').value;
            if (amount) {
                this.add(amount, type);
                document.getElementById('exp-amount').value = '';
            }
        };

        // Bridge
        window.ExpenseServiceBridge = {
            remove: (id) => this.remove(id)
        };
    }
};
