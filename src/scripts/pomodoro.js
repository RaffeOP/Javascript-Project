/**
 * Pomodoro Protocol Agent
 * Handles focus-driven time management and notifications.
 */

export const PomodoroService = {
    timer: null,
    workTime: 25,
    breakTime: 5,
    timeLeft: 25 * 60,
    isActive: false,
    isPaused: false,
    mode: 'work',

    init: function() {
        this.render();
    },

    toggle: function() {
        if (this.isActive && !this.isPaused) {
            this.pause();
        } else {
            this.start();
        }
    },

    start: function() {
        this.isActive = true;
        this.isPaused = false;
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) this.complete();
            this.render();
        }, 1000);
        this.render();
    },

    pause: function() {
        this.isPaused = true;
        clearInterval(this.timer);
        this.render();
    },

    adjustTime: function(amount) {
        // Now allows live adjustment during active cycles
        this.timeLeft = Math.max(0, this.timeLeft + (amount * 60));
        this.render();
    },

    complete: function() {
        this.stop();
        this.notify(`Cycle Complete: ${this.mode === 'work' ? 'Break Time!' : 'Back to Work!'}`);
        this.mode = this.mode === 'work' ? 'break' : 'work';
        this.timeLeft = (this.mode === 'work' ? this.workTime : this.breakTime) * 60;
        this.render();
    },

    reset: function() {
        this.stop();
        this.timeLeft = (this.mode === 'work' ? this.workTime : this.breakTime) * 60;
        this.render();
    },

    notify: function(msg) {
        if (Notification.permission === "granted") new Notification("Focus System", { body: msg });
        else if (Notification.permission !== "denied") Notification.requestPermission();
    },

    render: function() {
        const container = document.getElementById('widget-6');
        if (!container) return;

        const minutes = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
        const seconds = String(this.timeLeft % 60).padStart(2, '0');
        const contentArea = container.querySelector('.card-content');
        
        contentArea.innerHTML = `
            <h3>Focus Control</h3>
            <div class="pomodoro-display ${this.isActive && !this.isPaused ? 'active' : ''}">
                <div class="time-adjusters ${this.isActive ? 'disabled' : ''}">
                    <button onclick="window.PomoBridge.adjust(-5)">-5</button>
                    <div class="time-main">${minutes}:${seconds}</div>
                    <button onclick="window.PomoBridge.adjust(5)">+5</button>
                </div>
                <div class="mode-tag">${this.mode.toUpperCase()} CYCLE | ${this.mode === 'work' ? this.workTime : this.breakTime}m</div>
            </div>
            
            <div class="live-scaling">
                <button onclick="window.PomoBridge.adjust(-1)">-1m</button>
                <button onclick="window.PomoBridge.adjust(1)">+1m</button>
            </div>

            <div class="pomodoro-controls">
                <button id="pomo-toggle" class="${this.isActive && !this.isPaused ? 'stop' : 'start'}">
                    ${this.isActive && !this.isPaused ? 'PAUSE' : 'START'}
                </button>
                <button id="pomo-reset">RESET</button>
            </div>
        `;
        
        document.getElementById('pomo-toggle').onclick = () => this.toggle();
        document.getElementById('pomo-reset').onclick = () => this.reset();
        
        window.PomoBridge = { adjust: (n) => this.adjustTime(n) };
    }
};
