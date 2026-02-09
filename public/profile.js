// Profile page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthAndLoadProfile();
    setupEventListeners();
    setupImageEventListeners();
});

// Check if user is authenticated and load profile data
async function checkAuthAndLoadProfile() {
    try {
        const authResponse = await fetch('/auth/me');
        if (!authResponse.ok) {
            window.location.href = '/login.html';
            return;
        }

        const authData = await authResponse.json();
        if (!authData.loggedIn) {
            window.location.href = '/login.html';
            return;
        }

        // Load main content
        await loadProfileData();
        await loadAnalytics();
        await loadRecentOrders();
        await loadMFAStatus();

        // Show profile content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
    } catch (error) {
        console.error('Error checking auth:', error);
        showError('Failed to load profile. Please try again.');
    }
}

// Load profile data (name, email, phone, address, bio, memberSince, image)
async function loadProfileData() {
    try {
        const response = await fetch('/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');

        const profile = await response.json();

        document.getElementById('displayName').textContent = profile.name;
        document.getElementById('displayEmail').textContent = profile.email;
        document.getElementById('displayPhone').textContent =
            profile.phone || 'Not provided';
        document.getElementById('displayAddress').textContent =
            profile.address || 'Not provided';
        document.getElementById('displayBio').textContent =
            profile.bio || 'No bio provided';
        document.getElementById('displayMemberSince').textContent =
            new Date(profile.createdAt).toLocaleDateString();

        // Avatar
        loadProfileImage(profile.profileImage);
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile information. Please try again.');
    }
}

// Load analytics data
async function loadAnalytics() {
    try {
        const response = await fetch('/profile/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');

        const analytics = await response.json();

        document.getElementById('totalOrders').textContent =
            analytics.totalOrders || 0;

        const totalSpentValue = Number(analytics.totalSpent || 0);
        document.getElementById('totalSpent').textContent =
            `$${totalSpentValue.toFixed(2)}`;

        document.getElementById('favoriteCategory').textContent =
            analytics.favoriteCategory || 'N/A';

        // Display membership level with styling
        const membershipElement = document.getElementById('membershipLevel');
        const membershipLevel = analytics.membershipLevel || 'New Member';
        membershipElement.textContent = membershipLevel;
        
        // Add membership-specific styling
        membershipElement.className = 'stat-number membership-level';
        if (membershipLevel === 'Gold') {
            membershipElement.classList.add('gold-member');
        } else if (membershipLevel === 'Silver') {
            membershipElement.classList.add('silver-member');
        } else if (membershipLevel === 'Bronze') {
            membershipElement.classList.add('bronze-member');
        } else {
            membershipElement.classList.add('new-member');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Just show defaults, don't block page
    }
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch('/profile/recent-orders');
        if (!response.ok) throw new Error('Failed to fetch recent orders');

        const data = await response.json(); // expect { orders: [...] }

        const tbody = document.getElementById('recentOrdersBody');
        const table = document.getElementById('recentOrdersTable');
        const noOrdersMsg = document.getElementById('noOrdersMessage');

        tbody.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            table.style.display = 'none';
            noOrdersMsg.style.display = 'block';
            return;
        }

        noOrdersMsg.style.display = 'none';
        table.style.display = 'table';

        // Show up to 5 latest orders
        data.orders.slice(0, 5).forEach(order => {
            const tr = document.createElement('tr');

            const dateStr = new Date(order.createdAt).toLocaleDateString();
            const itemsCount = order.items ? order.items.length : 0;
            const total = Number(order.total || 0).toFixed(2);
            const status = 'Completed'; // Default status for now

            tr.innerHTML = `
                <td>#${order.id}</td>
                <td>${dateStr}</td>
                <td>${itemsCount} items</td>
                <td>$${total}</td>
                <td>${renderStatusBadge(status)}</td>
                <td>
                    <button class="view-order-btn" data-order-id="${order.id}">
                        View Details
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Delegate "View" button click
        tbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-order-btn')) {
                const orderId = e.target.dataset.orderId;
                // Redirect to order history page
                window.location.href = `/order-history.html?orderId=${orderId}`;
            }
        });
    } catch (error) {
        console.error('Error loading recent orders:', error);
        // Silent fail for this section
    }
}

// Render status badge HTML
function renderStatusBadge(status) {
    const lower = String(status).toLowerCase();
    let cls = 'order-status-badge order-status-pending';

    if (lower === 'delivered' || lower === 'completed') {
        cls = 'order-status-badge order-status-delivered';
    } else if (lower === 'cancelled' || lower === 'failed') {
        cls = 'order-status-badge order-status-cancelled';
    }

    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return `<span class="${cls}">${label}</span>`;
}

// Setup main event listeners
function setupEventListeners() {
    // Edit profile toggle
    document.getElementById('editProfileBtn')
        .addEventListener('click', () => toggleEditMode(true));

    document.getElementById('cancelEditBtn')
        .addEventListener('click', () => toggleEditMode(false));

    // Profile form submission
    document.getElementById('profileEditForm')
        .addEventListener('submit', handleProfileUpdate);

    // Password form submission
    document.getElementById('passwordChangeForm')
        .addEventListener('submit', handlePasswordChange);

    // MFA event listeners
    document.getElementById('toggleMFABtn')
        .addEventListener('click', handleMFAToggle);
    
    document.getElementById('mfaDisableForm')
        .addEventListener('submit', handleMFADisable);
    
    document.getElementById('cancelMFADisable')
        .addEventListener('click', () => {
            document.getElementById('mfaDisableForm').style.display = 'none';
            document.getElementById('mfaCurrentPassword').value = '';
        });

    // Password helpers
    document.getElementById('newPassword')
        .addEventListener('input', checkPasswordStrength);
    document.getElementById('confirmPassword')
        .addEventListener('input', checkPasswordMatch);

    // Logout
    document.getElementById('logoutFromProfile')
        .addEventListener('click', handleLogout);
}

// Toggle profile view/edit modes
function toggleEditMode(editMode) {
    const profileView = document.getElementById('profileView');
    const editForm = document.getElementById('profileEditForm');

    if (editMode) {
        // Populate fields from display values
        document.getElementById('editName').value =
            document.getElementById('displayName').textContent;

        document.getElementById('editEmail').value =
            document.getElementById('displayEmail').textContent;

        const currentPhone = document.getElementById('displayPhone').textContent;
        document.getElementById('editPhone').value =
            currentPhone === 'Not provided' ? '' : currentPhone;

        const currentAddress =
            document.getElementById('displayAddress').textContent;
        document.getElementById('editAddress').value =
            currentAddress === 'Not provided' ? '' : currentAddress;

        const currentBio = document.getElementById('displayBio').textContent;
        document.getElementById('editBio').value =
            currentBio === 'No bio provided' ? '' : currentBio;

        profileView.style.display = 'none';
        editForm.style.display = 'block';
    } else {
        profileView.style.display = 'block';
        editForm.style.display = 'none';
        editForm.reset();
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const formData = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value,
            bio: document.getElementById('editBio').value
        };

        const response = await fetch('/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update profile');
        }

        await loadProfileData();
        toggleEditMode(false);
        showSuccess('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        showError(error.message || 'Failed to update profile.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();

    const changeBtn = document.getElementById('changePasswordBtn');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }

    changeBtn.disabled = true;
    changeBtn.textContent = 'Changing...';

    try {
        const response = await fetch('/profile/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to change password');
        }

        document.getElementById('passwordChangeForm').reset();
        document.getElementById('passwordStrength').textContent = '';
        document.getElementById('passwordMatch').textContent = '';
        showSuccess('Password changed successfully!');
    } catch (error) {
        console.error('Error changing password:', error);
        showError(error.message || 'Failed to change password.');
    } finally {
        changeBtn.disabled = false;
        changeBtn.textContent = 'Change Password';
    }
}

// Password strength indicator
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthEl = document.getElementById('passwordStrength');

    if (password.length === 0) {
        strengthEl.textContent = '';
        strengthEl.className = 'password-strength';
        return;
    }

    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('at least 8 characters');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('uppercase letter');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('number');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('special character');

    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const level = levels[strength];

    strengthEl.textContent = `Strength: ${level}`;
    strengthEl.className = `password-strength strength-${strength}`;

    if (feedback.length > 0 && strength < 3) {
        strengthEl.textContent += ` (add ${feedback.join(', ')})`;
    }
}

// Confirm password match
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchEl = document.getElementById('passwordMatch');

    if (confirmPassword.length === 0) {
        matchEl.textContent = '';
        matchEl.className = 'password-match';
        return;
    }

    if (newPassword === confirmPassword) {
        matchEl.textContent = '✓ Passwords match';
        matchEl.className = 'password-match match-good';
    } else {
        matchEl.textContent = '✗ Passwords do not match';
        matchEl.className = 'password-match match-bad';
    }
}

// Handle logout
async function handleLogout() {
    try {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Error logging out:', error);
        window.location.href = '/';
    }
}

// Show error overlay (with auto-hide for non-critical)
function showError(message) {
    const errorState = document.getElementById('errorState');
    const loadingState = document.getElementById('loadingState');
    const profileContent = document.getElementById('profileContent');

    document.getElementById('errorMessage').textContent = message;
    errorState.style.display = 'block';
    loadingState.style.display = 'none';
    profileContent.style.display = 'none';

    if (!message.includes('Please try again')) {
        setTimeout(() => {
            errorState.style.display = 'none';
            profileContent.style.display = 'block';
        }, 5000);
    }
}

// Show top-right success toast
function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.textContent = message;
    successEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(successEl);
    setTimeout(() => successEl.remove(), 3000);
}

/* ===== PROFILE IMAGE FUNCTIONS ===== */

// Load and display profile image
function loadProfileImage(imageUrl) {
    const profileImageDisplay = document.getElementById('profileImageDisplay');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (imageUrl) {
        profileImageDisplay.src = imageUrl;
        profileImageDisplay.onerror = function () {
            this.src = '/images/default-avatar.svg';
        };
        removeImageBtn.style.display = 'block';
    } else {
        profileImageDisplay.src = '/images/default-avatar.svg';
        removeImageBtn.style.display = 'none';
    }
}

// Setup image upload events
function setupImageEventListeners() {
    const changeImageBtn = document.getElementById('changeImageBtn');
    const imageUploadSection = document.getElementById('imageUploadSection');
    const imageInput = document.getElementById('imageInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removePreviewBtn = document.getElementById('removePreviewBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const imageUploadForm = document.getElementById('imageUploadForm');
    const uploadArea = uploadPlaceholder.parentElement;

    // Show upload section
    changeImageBtn.addEventListener('click', () => {
        imageUploadSection.style.display = 'block';
        resetUploadForm();
    });

    // Cancel upload
    cancelUploadBtn.addEventListener('click', () => {
        imageUploadSection.style.display = 'none';
        resetUploadForm();
    });

    // File input change
    imageInput.addEventListener('change', handleFileSelect);

    // Click placeholder to choose file
    uploadPlaceholder.addEventListener('click', () => {
        imageInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Remove preview
    removePreviewBtn.addEventListener('click', () => {
        resetUploadForm();
    });

    // Submit upload
    imageUploadForm.addEventListener('submit', handleImageUpload);

    // Remove current image
    removeImageBtn.addEventListener('click', handleRemoveImage);
}

// File selected from input
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

// Drag over
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

// Drag leave
function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

// Drop file
function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        validateAndPreviewFile(files[0]);
    }
}

// Validate and preview image
function validateAndPreviewFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showError('Image must be smaller than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const uploadImageBtn = document.getElementById('uploadImageBtn');

        previewImage.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        imagePreview.style.display = 'block';
        uploadImageBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Handle actual image upload
async function handleImageUpload(event) {
    event.preventDefault();

    const imageInput = document.getElementById('imageInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadImageBtn = document.getElementById('uploadImageBtn');

    if (!imageInput.files[0]) {
        showError('Please select an image first.');
        return;
    }

    try {
        uploadProgress.style.display = 'block';
        uploadImageBtn.disabled = true;
        progressText.textContent = 'Uploading...';

        const formData = new FormData();
        formData.append('profileImage', imageInput.files[0]);

        // Fake progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            if (progress >= 90) clearInterval(progressInterval);
        }, 100);

        const response = await fetch('/profile-image/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json().catch(() => ({}));
        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (response.ok && result.success && result.data && result.data.imageUrl) {
            await updateProfileImage(result.data.imageUrl);
            loadProfileImage(result.data.imageUrl);
            document.getElementById('imageUploadSection').style.display = 'none';
            showSuccess('Profile image updated successfully!');
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('Failed to upload image: ' + error.message);
    } finally {
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
        uploadImageBtn.disabled = false;
        resetUploadForm();
    }
}

// Update profile record with new image URL
async function updateProfileImage(imageUrl) {
    const response = await fetch('/profile/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: imageUrl })
    });

    if (!response.ok) {
        throw new Error('Failed to update profile image.');
    }

    return response.json();
}

// Remove image
async function handleRemoveImage() {
    if (!confirm('Are you sure you want to remove your profile image?')) return;

    try {
        const response = await fetch('/profile/image', { method: 'DELETE' });

        if (response.ok) {
            loadProfileImage(null);
            showSuccess('Profile image removed successfully!');
        } else {
            throw new Error('Failed to remove image');
        }
    } catch (error) {
        console.error('Error removing image:', error);
        showError('Failed to remove profile image.');
    }
}

// Reset upload form UI
function resetUploadForm() {
    const imageInput = document.getElementById('imageInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');

    if (imageInput) imageInput.value = '';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
    if (imagePreview) imagePreview.style.display = 'none';
    if (uploadImageBtn) uploadImageBtn.disabled = true;
    if (uploadProgress) uploadProgress.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
}

// ============================================
// MFA (Multi-Factor Authentication) Functions
// ============================================

// Load MFA status
async function loadMFAStatus() {
    try {
        const response = await fetch('/profile/mfa/status');
        if (!response.ok) throw new Error('Failed to fetch MFA status');

        const data = await response.json();
        updateMFAUI(data.mfaEnabled);
    } catch (error) {
        console.error('Error loading MFA status:', error);
        updateMFAUI(false, true); // Show as disabled with error
    }
}

// Update MFA UI based on status
function updateMFAUI(enabled, hasError = false) {
    const statusDot = document.getElementById('mfaStatusDot');
    const statusText = document.getElementById('mfaStatusText');
    const toggleBtn = document.getElementById('toggleMFABtn');

    if (hasError) {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Unable to load MFA status';
        toggleBtn.textContent = 'Retry';
        toggleBtn.disabled = false;
        toggleBtn.className = 'btn btn-secondary';
        return;
    }

    if (enabled) {
        statusDot.className = 'status-dot enabled';
        statusText.textContent = 'Multi-Factor Authentication is enabled';
        toggleBtn.textContent = 'Disable MFA';
        toggleBtn.className = 'btn btn-danger';
    } else {
        statusDot.className = 'status-dot disabled';
        statusText.textContent = 'Multi-Factor Authentication is disabled';
        toggleBtn.textContent = 'Enable MFA';
        toggleBtn.className = 'btn btn-primary';
    }
    
    toggleBtn.disabled = false;
}

// Handle MFA toggle button click
async function handleMFAToggle() {
    const toggleBtn = document.getElementById('toggleMFABtn');
    const isCurrentlyEnabled = toggleBtn.textContent.includes('Disable');

    if (toggleBtn.textContent === 'Retry') {
        await loadMFAStatus();
        return;
    }

    if (isCurrentlyEnabled) {
        // Show disable form for security
        document.getElementById('mfaDisableForm').style.display = 'block';
        document.getElementById('mfaCurrentPassword').focus();
    } else {
        // Enable MFA
        await enableMFA();
    }
}

// Enable MFA
async function enableMFA() {
    const toggleBtn = document.getElementById('toggleMFABtn');
    
    try {
        toggleBtn.textContent = 'Enabling...';
        toggleBtn.disabled = true;

        const response = await fetch('/profile/mfa/enable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            updateMFAUI(true);
            showSuccess('Multi-Factor Authentication has been enabled.');
        } else {
            throw new Error(data.error || 'Failed to enable MFA');
        }
    } catch (error) {
        console.error('Error enabling MFA:', error);
        showError(`Failed to enable MFA: ${error.message}`);
        updateMFAUI(false); // Reset to previous state
    }
}

// Handle MFA disable form submission
async function handleMFADisable(event) {
    event.preventDefault();
    
    const form = event.target;
    const password = document.getElementById('mfaCurrentPassword').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!password) {
        showError('Please enter your current password');
        return;
    }

    try {
        submitBtn.textContent = 'Disabling...';
        submitBtn.disabled = true;

        const response = await fetch('/profile/mfa/disable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: password
            }),
        });

        const data = await response.json();

        if (response.ok) {
            updateMFAUI(false);
            form.style.display = 'none';
            document.getElementById('mfaCurrentPassword').value = '';
            showSuccess('Multi-Factor Authentication has been disabled.');
        } else {
            throw new Error(data.error || 'Failed to disable MFA');
        }
    } catch (error) {
        console.error('Error disabling MFA:', error);
        showError(`Failed to disable MFA: ${error.message}`);
    } finally {
        submitBtn.textContent = 'Confirm Disable';
        submitBtn.disabled = false;
    }
}

// Password visibility toggle function
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(`${inputId}-eye`);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈'; // Hide icon when password is visible
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️'; // Show icon when password is hidden
    }
}
