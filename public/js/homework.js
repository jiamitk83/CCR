let homeworkList = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadHomework();
    loadClasses();
    loadSubjects();
});

// Load homework
async function loadHomework() {
    try {
        const response = await fetch('/api/homework', { credentials: 'include' });
        homeworkList = await response.json();
        renderHomework();
    } catch (error) {
        console.error('Error loading homework:', error);
    }
}

// Load classes
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        const classes = await response.json();
        
        const select = document.getElementById('homework-class');
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls._id;
            option.textContent = cls.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load subjects
async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects', { credentials: 'include' });
        const subjects = await response.json();
        
        const select = document.getElementById('homework-subject');
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject._id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Render homework
function renderHomework() {
    const tbody = document.getElementById('homework-tbody');
    
    if (homeworkList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No homework found</td></tr>';
        return;
    }
    
    tbody.innerHTML = homeworkList.map(hw => `
        <tr>
            <td><strong>${hw.title}</strong></td>
            <td>${hw.className || 'N/A'}</td>
            <td>${hw.subjectName || 'N/A'}</td>
            <td>${formatDate(hw.dueDate)}</td>
            <td>${hw.description || '-'}</td>
            <td>
                <span class="badge bg-${getStatusColor(hw.status)}">${hw.status || 'active'}</span>
            </td>
        </tr>
    `).join('');
}

// Get status color
function getStatusColor(status) {
    switch(status) {
        case 'active': return 'success';
        case 'closed': return 'secondary';
        default: return 'primary';
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
}

// Handle homework form submission
document.getElementById('homework-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        classId: document.getElementById('homework-class').value,
        subjectId: document.getElementById('homework-subject').value,
        title: document.getElementById('homework-title').value,
        description: document.getElementById('homework-description').value,
        dueDate: document.getElementById('homework-due-date').value
    };
    
    try {
        const response = await fetch('/api/homework', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to create homework');
        
        bootstrap.Modal.getInstance(document.getElementById('homeworkModal')).hide();
        e.target.reset();
        loadHomework();
        alert('Homework assigned successfully');
    } catch (error) {
        console.error('Error creating homework:', error);
        alert('Error creating homework');
    }
});
