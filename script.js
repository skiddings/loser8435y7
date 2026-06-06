// Key System Logic
const keySystem = {
    currentStep: 1,
    totalSteps: 3,
    checkpointLinks: [
        'https://linkvertise.com/YOUR-LINK-1', // Replace with your actual Linkvertise links
        'https://linkvertise.com/YOUR-LINK-2',
        'https://linkvertise.com/YOUR-LINK-3'
    ],
    
    init() {
        this.checkProgress();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const checkpointBtn = document.getElementById('checkpoint-btn');
        const copyBtn = document.getElementById('copy-btn');
        const useKeyBtn = document.getElementById('use-key-btn');
        
        checkpointBtn.addEventListener('click', () => this.startCheckpoint());
        copyBtn.addEventListener('click', () => this.copyKey());
        useKeyBtn.addEventListener('click', () => this.useKey());
    },
    
    checkProgress() {
        const savedProgress = localStorage.getItem('keySystemProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            
            // Check if key is still valid
            if (progress.keyExpiry && Date.now() < progress.keyExpiry) {
                this.currentStep = 4; // Skip to key display
                this.showKey(progress.key);
                return;
            } else if (progress.keyExpiry && Date.now() >= progress.keyExpiry) {
                // Key expired, reset
                localStorage.removeItem('keySystemProgress');
            } else if (progress.step) {
                this.currentStep = progress.step;
                this.updateUI();
            }
        }
    },
    
    startCheckpoint() {
        const btn = document.getElementById('checkpoint-btn');
        btn.disabled = true;
        btn.textContent = 'Opening Checkpoint...';
        
        // Open Linkvertise checkpoint (will be converted by Full Script API)
        const checkpointLink = this.checkpointLinks[this.currentStep - 1];
        window.open(checkpointLink, '_blank');
        
        // Simulate checkpoint completion (in real scenario, you'd verify via backend)
        setTimeout(() => {
            this.completeCheckpoint();
        }, 3000);
    },
    
    completeCheckpoint() {
        // Mark current step as completed
        const stepEl = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        stepEl.classList.remove('active');
        stepEl.classList.add('completed');
        
        this.currentStep++;
        
        if (this.currentStep <= this.totalSteps) {
            // Move to next checkpoint
            this.updateUI();
            this.saveProgress();
        } else {
            // All checkpoints completed, generate key
            this.generateKey();
        }
    },
    
    updateUI() {
        // Update step indicator
        const nextStep = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        if (nextStep) {
            nextStep.classList.add('active');
        }
        
        // Update text
        document.getElementById('current-step').textContent = this.currentStep;
        document.getElementById('checkpoint-desc').textContent = 
            `Click the button below to complete checkpoint ${this.currentStep}`;
        
        // Update button
        const btn = document.getElementById('checkpoint-btn');
        btn.disabled = false;
        btn.textContent = `Start Checkpoint ${this.currentStep}`;
        
        // Update progress bar
        const progress = ((this.currentStep - 1) / this.totalSteps) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-percent').textContent = Math.round(progress);
    },
    
    generateKey() {
        // Generate a random key
        const key = this.createRandomKey(16);
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        // Save key with expiry
        const progress = {
            step: this.currentStep,
            key: key,
            keyExpiry: expiryTime
        };
        localStorage.setItem('keySystemProgress', JSON.stringify(progress));
        
        // Update progress bar to 100%
        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('progress-percent').textContent = '100';
        
        // Show key after a short delay
        setTimeout(() => {
            this.showKey(key);
        }, 500);
    },
    
    createRandomKey(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < length; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    },
    
    showKey(key) {
        // Hide checkpoint container
        document.getElementById('checkpoint-container').style.display = 'none';
        
        // Show key result
        const resultDiv = document.getElementById('key-result');
        resultDiv.style.display = 'block';
        
        // Display key
        document.getElementById('key-output').value = key;
        
        // Update expiry countdown
        this.updateExpiryCountdown();
    },
    
    updateExpiryCountdown() {
        const progress = JSON.parse(localStorage.getItem('keySystemProgress'));
        if (!progress || !progress.keyExpiry) return;
        
        const updateTime = () => {
            const remaining = progress.keyExpiry - Date.now();
            if (remaining <= 0) {
                document.getElementById('expiry-time').textContent = 'Expired';
                localStorage.removeItem('keySystemProgress');
                return;
            }
            
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('expiry-time').textContent = `${hours}h ${minutes}m`;
        };
        
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    },
    
    copyKey() {
        const keyInput = document.getElementById('key-output');
        keyInput.select();
        document.execCommand('copy');
        
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = 'Copy Key';
            copyBtn.classList.remove('copied');
        }, 2000);
    },
    
    useKey() {
        const key = document.getElementById('key-output').value;
        
        // Here you would typically validate the key with your backend
        // For now, we'll just redirect or show a message
        
        alert(`Key activated: ${key}\n\nYou can now access the protected content!`);
        
        // Option 1: Redirect to protected content
        // window.location.href = 'protected-content.html?key=' + key;
        
        // Option 2: Download file
        // window.location.href = 'download.php?key=' + key;
        
        // Option 3: Show protected content on same page
        // document.getElementById('protected-section').style.display = 'block';
    },
    
    saveProgress() {
        const progress = {
            step: this.currentStep
        };
        localStorage.setItem('keySystemProgress', JSON.stringify(progress));
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    keySystem.init();
});

// Debug: Clear progress (remove this in production)
// Uncomment the line below to reset the system during testing
// localStorage.removeItem('keySystemProgress');
