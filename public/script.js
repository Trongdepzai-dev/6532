// ===== GLOBAL VARIABLES =====
let currentForm = 'login';
const forms = {
    login: document.getElementById('loginForm'),
    register: document.getElementById('registerForm'),
    forgotPassword: document.getElementById('forgotPasswordForm')
};

// ===== UTILITY FUNCTIONS =====
const showToast = (message, type = 'info', title = '') => {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="toast-icon ${icons[type]}"></i>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
};

const showLoading = () => {
    document.getElementById('loadingOverlay').classList.remove('hidden');
};

const hideLoading = () => {
    document.getElementById('loadingOverlay').classList.add('hidden');
};

const showError = (inputId, message) => {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');
    
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = message;
    errorElement.classList.add('show');
};

const clearError = (inputId) => {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');
    
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
};

const showSuccess = (inputId) => {
    const input = document.getElementById(inputId);
    input.classList.add('success');
    input.classList.remove('error');
};

// ===== VALIDATION FUNCTIONS =====
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
        strength: calculatePasswordStrength(password),
        requirements: {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar
        }
    };
};

const calculatePasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
};

const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(name);
};

// ===== FORM SWITCHING =====
const switchForm = (formName) => {
    // Hide all forms
    Object.values(forms).forEach(form => {
        form.classList.remove('active');
    });
    
    // Show target form
    forms[formName].classList.add('active');
    currentForm = formName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (formName !== 'forgotPassword') {
        document.querySelector(`[data-tab="${formName}"]`).classList.add('active');
    }
    
    // Clear all errors when switching forms
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
    
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error', 'success');
    });
};

// ===== REAL-TIME VALIDATION =====
const setupRealTimeValidation = () => {
    // Login form validation
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    loginEmail.addEventListener('blur', () => {
        const value = loginEmail.value.trim();
        if (value && !validateEmail(value)) {
            showError('loginEmail', 'Vui lòng nhập email hợp lệ');
        } else {
            clearError('loginEmail');
            if (value) showSuccess('loginEmail');
        }
    });
    
    loginPassword.addEventListener('blur', () => {
        const value = loginPassword.value;
        if (value && value.length < 6) {
            showError('loginPassword', 'Mật khẩu phải có ít nhất 6 ký tự');
        } else {
            clearError('loginPassword');
            if (value) showSuccess('loginPassword');
        }
    });
    
    // Register form validation
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    registerName.addEventListener('blur', () => {
        const value = registerName.value.trim();
        if (value && !validateName(value)) {
            showError('registerName', 'Họ tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái');
        } else {
            clearError('registerName');
            if (value) showSuccess('registerName');
        }
    });
    
    registerEmail.addEventListener('blur', () => {
        const value = registerEmail.value.trim();
        if (value && !validateEmail(value)) {
            showError('registerEmail', 'Vui lòng nhập email hợp lệ');
        } else {
            clearError('registerEmail');
            if (value) showSuccess('registerEmail');
        }
    });
    
    registerPassword.addEventListener('input', () => {
        const value = registerPassword.value;
        const validation = validatePassword(value);
        
        // Update password strength indicator
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (value) {
            strengthFill.className = `strength-fill ${validation.strength}`;
            
            const strengthTexts = {
                weak: 'Yếu',
                fair: 'Trung bình',
                good: 'Tốt',
                strong: 'Mạnh'
            };
            
            strengthText.textContent = `Độ mạnh mật khẩu: ${strengthTexts[validation.strength]}`;
        } else {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Độ mạnh mật khẩu';
        }
    });
    
    registerPassword.addEventListener('blur', () => {
        const value = registerPassword.value;
        const validation = validatePassword(value);
        
        if (value && !validation.isValid) {
            showError('registerPassword', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
        } else {
            clearError('registerPassword');
            if (value) showSuccess('registerPassword');
        }
    });
    
    confirmPassword.addEventListener('blur', () => {
        const value = confirmPassword.value;
        const passwordValue = registerPassword.value;
        
        if (value && value !== passwordValue) {
            showError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        } else {
            clearError('confirmPassword');
            if (value) showSuccess('confirmPassword');
        }
    });
    
    // Forgot password validation
    const forgotEmail = document.getElementById('forgotEmail');
    
    forgotEmail.addEventListener('blur', () => {
        const value = forgotEmail.value.trim();
        if (value && !validateEmail(value)) {
            showError('forgotEmail', 'Vui lòng nhập email hợp lệ');
        } else {
            clearError('forgotEmail');
            if (value) showSuccess('forgotEmail');
        }
    });
};

// ===== PASSWORD TOGGLE =====
const setupPasswordToggle = () => {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = toggle.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                toggle.classList.add('active');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                toggle.classList.remove('active');
            }
        });
    });
};

// ===== FORM SUBMISSIONS =====
const handleLogin = async (formData) => {
    showLoading();
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock validation
        const email = formData.get('email');
        const password = formData.get('password');
        
        if (email === 'admin@viethub.com' && password === 'admin123') {
            showToast('Đăng nhập thành công!', 'success', 'Chào mừng');
            // Redirect to dashboard or main app
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            showToast('Email hoặc mật khẩu không chính xác', 'error', 'Đăng nhập thất bại');
        }
    } catch (error) {
        showToast('Có lỗi xảy ra, vui lòng thử lại', 'error', 'Lỗi hệ thống');
    } finally {
        hideLoading();
    }
};

const handleRegister = async (formData) => {
    showLoading();
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Mock successful registration
        showToast('Tài khoản đã được tạo thành công!', 'success', 'Đăng ký thành công');
        
        // Switch to login form
        setTimeout(() => {
            switchForm('login');
            showToast('Vui lòng đăng nhập với tài khoản mới', 'info');
        }, 1500);
        
    } catch (error) {
        showToast('Có lỗi xảy ra, vui lòng thử lại', 'error', 'Lỗi hệ thống');
    } finally {
        hideLoading();
    }
};

const handleForgotPassword = async (formData) => {
    showLoading();
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const email = formData.get('email');
        showToast(`Liên kết đặt lại mật khẩu đã được gửi đến ${email}`, 'success', 'Email đã gửi');
        
        // Switch back to login form
        setTimeout(() => {
            switchForm('login');
        }, 2000);
        
    } catch (error) {
        showToast('Có lỗi xảy ra, vui lòng thử lại', 'error', 'Lỗi hệ thống');
    } finally {
        hideLoading();
    }
};

// ===== SOCIAL LOGIN =====
const handleSocialLogin = (provider) => {
    showLoading();
    
    // Simulate social login
    setTimeout(() => {
        hideLoading();
        showToast(`Đăng nhập với ${provider} thành công!`, 'success', 'Chào mừng');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    }, 2000);
};

// ===== FORM VALIDATION =====
const validateForm = (formElement) => {
    const inputs = formElement.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const inputId = input.id;
        
        // Clear previous errors
        clearError(inputId);
        
        // Check if empty
        if (!value) {
            showError(inputId, 'Trường này là bắt buộc');
            isValid = false;
            return;
        }
        
        // Specific validations
        if (input.type === 'email' && !validateEmail(value)) {
            showError(inputId, 'Email không hợp lệ');
            isValid = false;
        }
        
        if (input.name === 'name' && !validateName(value)) {
            showError(inputId, 'Họ tên không hợp lệ');
            isValid = false;
        }
        
        if (input.name === 'password' && currentForm === 'register') {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                showError(inputId, 'Mật khẩu không đủ mạnh');
                isValid = false;
            }
        }
        
        if (input.name === 'confirmPassword') {
            const passwordValue = document.getElementById('registerPassword').value;
            if (value !== passwordValue) {
                showError(inputId, 'Mật khẩu xác nhận không khớp');
                isValid = false;
            }
        }
    });
    
    // Check terms agreement for register form
    if (currentForm === 'register') {
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            showToast('Vui lòng đồng ý với điều khoản sử dụng', 'warning');
            isValid = false;
        }
    }
    
    return isValid;
};

// ===== BUTTON LOADING STATE =====
const setButtonLoading = (button, loading) => {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.opacity = '0';
        btnLoader.classList.remove('hidden');
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnLoader.classList.add('hidden');
        button.disabled = false;
    }
};

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchForm(tab);
        });
    });
    
    // Back to login button
    document.getElementById('backToLogin').addEventListener('click', () => {
        switchForm('login');
    });
    
    // Forgot password link
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        switchForm('forgotPassword');
    });
    
    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm(e.target)) return;
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        setButtonLoading(submitBtn, true);
        await handleLogin(formData);
        setButtonLoading(submitBtn, false);
    });
    
    document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm(e.target)) return;
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        setButtonLoading(submitBtn, true);
        await handleRegister(formData);
        setButtonLoading(submitBtn, false);
    });
    
    document.getElementById('forgotPasswordFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm(e.target)) return;
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        setButtonLoading(submitBtn, true);
        await handleForgotPassword(formData);
        setButtonLoading(submitBtn, false);
    });
    
    // Social login buttons
    document.getElementById('googleLogin').addEventListener('click', () => {
        handleSocialLogin('Google');
    });
    
    document.getElementById('facebookLogin').addEventListener('click', () => {
        handleSocialLogin('Facebook');
    });
    
    document.getElementById('googleRegister').addEventListener('click', () => {
        handleSocialLogin('Google');
    });
    
    document.getElementById('facebookRegister').addEventListener('click', () => {
        handleSocialLogin('Facebook');
    });
    
    // Setup real-time validation
    setupRealTimeValidation();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open toasts
            document.querySelectorAll('.toast').forEach(toast => {
                toast.querySelector('.toast-close').click();
            });
        }
    });
    
    // Auto-focus first input
    const activeForm = document.querySelector('.form-container.active');
    const firstInput = activeForm.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Welcome message
    setTimeout(() => {
        showToast('Chào mừng đến với VietHub! Vui lòng đăng nhập hoặc tạo tài khoản mới.', 'info', 'Chào mừng');
    }, 1000);
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Announce form changes to screen readers
const announceFormChange = (formName) => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    const messages = {
        login: 'Đã chuyển sang form đăng nhập',
        register: 'Đã chuyển sang form đăng ký',
        forgotPassword: 'Đã chuyển sang form quên mật khẩu'
    };
    
    announcer.textContent = messages[formName];
    document.body.appendChild(announcer);
    
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
};

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for input validation
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

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    showToast('Có lỗi không mong muốn xảy ra', 'error', 'Lỗi hệ thống');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    showToast('Có lỗi không mong muốn xảy ra', 'error', 'Lỗi hệ thống');
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePassword,
        validateName,
        calculatePasswordStrength
    };
}