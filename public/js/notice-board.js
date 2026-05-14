let notices = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadNotices();
});

// Load notices
async function loadNotices() {
    try {
        const response = await fetch('/api/notices', { credentials: 'include' });
        notices = await response.json();
        renderNotices();
    } catch (error) {
        console.error('Error loading notices:', error);
    }
}

// Render notices
function renderNotices() {
    const container = document.getElementById('notices-container');
    
    if (notices.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">No notices found</div>';
        return;
    }
    
    container.innerHTML = notices.map(notice => `
        <div class="col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span class="badge bg-${getPriorityColor(notice.priority)}">${notice.priority || 'normal'}</span>
                    <small class="text-muted">${formatDate(notice.createdAt)}</small>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${notice.title}</h5>
                    <p class="card-text">${notice.content}</p>
                    <small class="text-muted">
                        <i class="fas fa-tag"></i> ${notice.category || 'general'}
                        ${notice.expiryDate ? ' | Expires: ' + formatDate(notice.expiryDate) : ''}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

// Get priority color
function getPriorityColor(priority) {
    switch(priority) {
        case 'urgent': return 'danger';
        case 'high': return 'warning';
        case 'normal': return 'primary';
        default: return 'secondary';
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
}

// Handle notice form submission
document.getElementById('notice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('notice-title').value,
        content: document.getElementById('notice-content').value,
        category: document.getElementById('notice-category').value,
        expiryDate: document.getElementById('notice-expiry').value,
        priority: 'normal'
    };
    
    try {
        const response = await fetch('/api/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to create notice');
        
        bootstrap.Modal.getInstance(document.getElementById('noticeModal')).hide();
        e.target.reset();
        loadNotices();
        alert('Notice posted successfully');
    } catch (error) {
        console.error('Error creating notice:', error);
        alert('Error creating notice');
    }
});
