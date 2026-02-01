document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MOBILE MENU LOGIC (Enhanced)
    // ==========================================
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    const body = document.body;

    const toggleMenu = (shouldClose = null) => {
        if (!mobileMenu || !overlay) return;

        const isClosed = mobileMenu.classList.contains('translate-x-full');
        const shouldOpen = shouldClose === null ? isClosed : !shouldClose;
        
        if (shouldOpen) {
            // Open menu
            mobileMenu.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            body.classList.add('overflow-hidden');
            
            // Set focus to close button for accessibility
            setTimeout(() => closeBtn?.focus(), 100);
        } else {
            // Close menu
            mobileMenu.classList.add('translate-x-full');
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            body.classList.remove('overflow-hidden');
            
            // Return focus to menu button
            menuBtn?.focus();
        }
    };

    // Event listeners
    menuBtn?.addEventListener('click', () => toggleMenu());
    closeBtn?.addEventListener('click', () => toggleMenu(true));
    overlay?.addEventListener('click', () => toggleMenu(true));

    // Close menu when clicking nav links
    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // ESC key to close menu (Accessibility)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu?.classList.contains('translate-x-full')) {
            toggleMenu(true);
        }
    });

    // ==========================================
    // 2. ACTIVE PILL LOGIC (Optimized)
    // ==========================================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.nav-link-mobile');

    // Desktop navigation
    navLinks.forEach(link => {
        const activeClasses = ['bg-gray-900', 'text-white', 'shadow-md'];
        const inactiveClasses = ['text-gray-600', 'hover:text-gray-900', 'hover:bg-gray-50'];
        
        const isActive = link.getAttribute('href') === currentPath;
        
        if (isActive) {
            link.classList.add(...activeClasses);
            link.classList.remove(...inactiveClasses);
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.add(...inactiveClasses);
            link.classList.remove(...activeClasses);
            link.removeAttribute('aria-current');
        }
    });

    // Mobile navigation
    mobileLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('bg-gray-100', 'text-gray-900', 'font-bold');
            link.classList.remove('text-gray-700');
            link.setAttribute('aria-current', 'page');
        }
    });

    // ==========================================
    // 3. SUBSCRIPTION FORM LOGIC (Enhanced)
    // ==========================================
    const subForm = document.getElementById('subscribe-form');
    
    if (subForm) {
        subForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = subForm.querySelector('button[type="submit"]');
            const input = document.getElementById('sub-email');
            const email = input?.value?.trim();
            
            if (!btn || !input) return;

            // Email validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!email || !emailRegex.test(email)) {
                showSubToast('Please enter a valid email address', true);
                input.focus();
                return;
            }

            const originalText = btn.innerText;
            
            // Disable button and show loading state
            btn.innerText = "Joining...";
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                const res = await fetch('/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (res.ok) {
                    showSubToast(data.message || 'Successfully subscribed! Check your inbox.', false);
                    input.value = '';
                    
                    // Optional: Track subscription analytics
                    // gtag?.('event', 'subscribe', { method: 'newsletter' });
                } else {
                    throw new Error(data.error || 'Subscription failed. Please try again.');
                }

            } catch (err) {
                console.error('Subscription error:', err);
                showSubToast(err.message || 'Network error. Please check your connection.', true);
            } finally {
                // Re-enable button
                btn.innerText = originalText;
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }

    // Toast notification system
    function showSubToast(msg, isError = false) {
        const toast = document.getElementById('sub-toast');
        if (!toast) return;

        const toastText = toast.querySelector('span');
        const toastBox = toast.querySelector('div');

        if (!toastText || !toastBox) return;

        toastText.innerText = msg;
        
        // Update toast styling based on error state
        if (isError) {
            toastBox.classList.remove('border-gray-900', 'bg-gray-50');
            toastBox.classList.add('border-red-500', 'bg-red-50');
        } else {
            toastBox.classList.remove('border-red-500', 'bg-red-50');
            toastBox.classList.add('border-gray-900', 'bg-gray-50');
        }

        // Show toast
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        // Auto-hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 4000);
    }

    // ==========================================
    // 4. PERFORMANCE OPTIMIZATIONS
    // ==========================================
    
    // Debounce resize events if needed in future
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Example: window.addEventListener('resize', debounce(() => { /* code */ }, 250));
});
