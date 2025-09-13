// Pine Genie Pro Website JavaScript

class PineGenieWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFAQ();
        this.setupScrollAnimations();
        this.setupProgressAnimation();
        this.setupPricingButtons();
        this.setupSmoothScroll();
        this.setupMobileMenu();
    }

    setupNavigation() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            }
        });

        // Active nav link highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faq => {
                    faq.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    setupScrollAnimations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .step-item, .guide-section');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });

        // Stagger animation for feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    setupProgressAnimation() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            let progress = 0;
            const targetProgress = 73;
            
            const animateProgress = () => {
                if (progress < targetProgress) {
                    progress += 1;
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `Optimizing... ${progress}% Complete`;
                    setTimeout(animateProgress, 50);
                } else {
                    // Reset and repeat
                    setTimeout(() => {
                        progress = 0;
                        animateProgress();
                    }, 2000);
                }
            };

            // Start animation when hero section is visible
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateProgress();
                        heroObserver.unobserve(entry.target);
                    }
                });
            });

            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroObserver.observe(heroSection);
            }
        }
    }

    setupPricingButtons() {
        const pricingButtons = document.querySelectorAll('.pricing-btn');
        
        pricingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const planName = e.target.closest('.pricing-card').querySelector('.plan-name').textContent;
                
                if (planName === 'Free Trial') {
                    this.startFreeTrial();
                } else if (planName === 'Pro') {
                    this.purchaseProLicense();
                } else if (planName === 'Team') {
                    this.contactSales();
                }
            });
        });
    }

    startFreeTrial() {
        // Redirect to Chrome Web Store or show trial activation
        this.showNotification('Redirecting to Chrome Web Store for free trial...', 'info');
        setTimeout(() => {
            window.open('https://chrome.google.com/webstore/detail/pine-genie', '_blank');
        }, 1000);
    }

    purchaseProLicense() {
        // Show payment modal or redirect to payment page
        this.showPaymentModal('pro');
    }

    contactSales() {
        // Open contact form or redirect to sales page
        this.showNotification('Redirecting to sales contact...', 'info');
        setTimeout(() => {
            window.location.href = 'mailto:sales@pinegenie.com?subject=Team License Inquiry';
        }, 1000);
    }

    showPaymentModal(plan) {
        // Create payment modal
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass">
                <div class="modal-header">
                    <h3>Purchase ${plan.charAt(0).toUpperCase() + plan.slice(1)} License</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-options">
                        <div class="payment-option" data-method="stripe">
                            <div class="payment-icon">💳</div>
                            <div class="payment-info">
                                <h4>Credit Card</h4>
                                <p>Secure payment via Stripe</p>
                            </div>
                        </div>
                        <div class="payment-option" data-method="paypal">
                            <div class="payment-icon">🅿️</div>
                            <div class="payment-info">
                                <h4>PayPal</h4>
                                <p>Pay with your PayPal account</p>
                            </div>
                        </div>
                        <div class="payment-option" data-method="crypto">
                            <div class="payment-icon">₿</div>
                            <div class="payment-info">
                                <h4>Cryptocurrency</h4>
                                <p>Bitcoin, Ethereum, USDT</p>
                            </div>
                        </div>
                    </div>
                    <div class="license-info">
                        <h4>What you'll get:</h4>
                        <ul>
                            <li>✅ Unlimited optimizations</li>
                            <li>✅ All AI algorithms</li>
                            <li>✅ 3D visualization</li>
                            <li>✅ Priority support</li>
                            <li>✅ 30-day money-back guarantee</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">Cancel</button>
                    <button class="btn-primary modal-proceed">Proceed to Payment</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal event listeners
        const closeModal = () => {
            modal.remove();
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Payment method selection
        const paymentOptions = modal.querySelectorAll('.payment-option');
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Proceed to payment
        modal.querySelector('.modal-proceed').addEventListener('click', () => {
            const selectedMethod = modal.querySelector('.payment-option.selected');
            if (selectedMethod) {
                const method = selectedMethod.dataset.method;
                this.processPayment(method, plan);
                closeModal();
            } else {
                this.showNotification('Please select a payment method', 'warning');
            }
        });

        // Add modal styles
        this.addModalStyles();
    }

    processPayment(method, plan) {
        this.showNotification(`Processing ${method} payment for ${plan} license...`, 'info');
        
        // Simulate payment processing
        setTimeout(() => {
            const licenseKey = this.generateLicenseKey();
            this.showLicenseModal(licenseKey);
        }, 2000);
    }

    generateLicenseKey() {
        // Generate a random 32-character license key
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    showLicenseModal(licenseKey) {
        const modal = document.createElement('div');
        modal.className = 'license-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass">
                <div class="modal-header">
                    <h3>🎉 Payment Successful!</h3>
                </div>
                <div class="modal-body">
                    <div class="success-message">
                        <p>Your Pine Genie Pro license has been activated!</p>
                        <div class="license-key-display">
                            <label>Your License Key:</label>
                            <div class="license-key">
                                <code>${licenseKey}</code>
                                <button class="copy-btn" data-key="${licenseKey}">📋</button>
                            </div>
                        </div>
                        <div class="next-steps">
                            <h4>Next Steps:</h4>
                            <ol>
                                <li>Copy your license key above</li>
                                <li>Install the Chrome extension</li>
                                <li>Enter your license key in the extension</li>
                                <li>Start optimizing your strategies!</li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary download-extension">Download Extension</button>
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Copy license key functionality
        modal.querySelector('.copy-btn').addEventListener('click', (e) => {
            const key = e.target.dataset.key;
            navigator.clipboard.writeText(key).then(() => {
                this.showNotification('License key copied to clipboard!', 'success');
            });
        });

        // Modal close
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Download extension
        modal.querySelector('.download-extension').addEventListener('click', () => {
            window.open('https://chrome.google.com/webstore/detail/pine-genie', '_blank');
            closeModal();
        });
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .payment-modal, .license-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .modal-content {
                position: relative;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 20px;
                animation: modalSlideIn 0.3s ease;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.3rem;
            }

            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }

            .modal-body {
                padding: 30px;
            }

            .payment-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }

            .payment-option {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .payment-option:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .payment-option.selected {
                background: rgba(102, 126, 234, 0.1);
                border-color: rgba(102, 126, 234, 0.5);
            }

            .payment-icon {
                font-size: 2rem;
                min-width: 50px;
                text-align: center;
            }

            .payment-info h4 {
                margin: 0 0 5px 0;
                font-size: 1.1rem;
            }

            .payment-info p {
                margin: 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .license-info {
                background: rgba(255, 255, 255, 0.03);
                padding: 20px;
                border-radius: 10px;
            }

            .license-info h4 {
                margin: 0 0 15px 0;
            }

            .license-info ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .license-info li {
                padding: 5px 0;
                color: var(--text-secondary);
            }

            .modal-footer {
                display: flex;
                gap: 15px;
                padding: 25px 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .modal-footer button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .license-key-display {
                margin: 20px 0;
            }

            .license-key-display label {
                display: block;
                margin-bottom: 10px;
                font-weight: 600;
            }

            .license-key {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .license-key code {
                flex: 1;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                color: #4facfe;
                letter-spacing: 1px;
            }

            .copy-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .copy-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }

            .next-steps {
                margin-top: 20px;
            }

            .next-steps h4 {
                margin-bottom: 15px;
            }

            .next-steps ol {
                padding-left: 20px;
                color: var(--text-secondary);
            }

            .next-steps li {
                margin-bottom: 8px;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupSmoothScroll() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add notification styles if not exists
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10001;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    max-width: 300px;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }

                .notification-success {
                    background: linear-gradient(135deg, #4caf50, #45a049);
                }

                .notification-error {
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                }

                .notification-warning {
                    background: linear-gradient(135deg, #ff9800, #f57c00);
                }

                .notification-info {
                    background: linear-gradient(135deg, #2196f3, #1976d2);
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize website functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PineGenieWebsite();
});

// Add CSS for active nav links
const navStyles = document.createElement('style');
navStyles.textContent = `
    .nav-link.active {
        color: var(--text-primary) !important;
        position: relative;
    }

    .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--primary-gradient);
        border-radius: 1px;
    }

    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 50px;
            transition: right 0.3s ease;
        }

        .nav-menu.active {
            right: 0;
        }

        .nav-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;
document.head.appendChild(navStyles);