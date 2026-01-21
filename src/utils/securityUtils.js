class AuditLogger {
    constructor() {
        this.endpoint = import.meta.env.VITE_AUDIT_ENDPOINT || '/api/audit/log';
        this.queue = [];
        this.isSending = false;
    }

    async log(level, event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            event,
            data: {
                ...data,
                userAgent: navigator.userAgent,
                url: window.location.href,
                path: window.location.pathname
            }
        };

        if (import.meta.env.PROD) {
            this.queue.push(logEntry);
            this.processQueue();
        } else {
            //
        }

        this.saveLocal(logEntry);
    }

    async processQueue() {
        if (this.isSending || this.queue.length === 0) return;

        this.isSending = true;
        const entry = this.queue.shift();

        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry),
                keepalive: true
            });
        } catch (error) {
            console.error('Failed to send audit log:', error);
            this.queue.unshift(entry);
        } finally {
            this.isSending = false;
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }

    saveLocal(entry) {
        try {
            const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
            logs.push(entry);
            
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('audit_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save audit log locally:', error);
        }
    }

    info(event, data) {
        return this.log('info', event, data);
    }

    warn(event, data) {
        return this.log('warn', event, data);
    }

    error(event, data) {
        return this.log('error', event, data);
    }
}

class SecurityMonitor {
    constructor() {
        this.rateLimitStore = new Map();
        this.MAX_ATTEMPTS = 5;
        this.WINDOW_MS = 15 * 60 * 1000;
    }

    async checkRateLimit(action, identifier) {
        const key = `${action}:${identifier}`;
        const now = Date.now();
        
        const attempts = this.rateLimitStore.get(key) || [];
        
        const validAttempts = attempts.filter(time => now - time < this.WINDOW_MS);
        
        if (validAttempts.length >= this.MAX_ATTEMPTS) {
            return false;
        }
        
        validAttempts.push(now);
        this.rateLimitStore.set(key, validAttempts);
        
        setTimeout(() => {
            const currentAttempts = this.rateLimitStore.get(key) || [];
            const updated = currentAttempts.filter(time => now - time < this.WINDOW_MS);
            if (updated.length === 0) {
                this.rateLimitStore.delete(key);
            } else {
                this.rateLimitStore.set(key, updated);
            }
        }, this.WINDOW_MS);
        
        return true;
    }

    async logDeviceFingerprint(userId) {
        const fingerprint = await this.generateFingerprint();
        
        try {
            const stored = localStorage.getItem(`fingerprint_${userId}`);
            if (!stored) {
                localStorage.setItem(`fingerprint_${userId}`, fingerprint);
            } else if (stored !== fingerprint) {
                console.warn('Device fingerprint changed for user:', userId);
            }
        } catch (error) {
            console.error('Error logging device fingerprint:', error);
        }
    }

    async generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!navigator.cookieEnabled,
            navigator.hardwareConcurrency || 'unknown'
        ];
        
        const str = components.join('|');
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }
}

export const auditLogger = new AuditLogger();
export const securityMonitor = new SecurityMonitor();

export const generateNonce = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};