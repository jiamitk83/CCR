let allStudents = [];
let allClasses = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
    loadStudents();
    
    // Setup search
    document.getElementById('search-input').addEventListener('keyup', debounce(loadStudents, 500));
    document.getElementById('class-filter').addEventListener('change', loadStudents);
    document.getElementById('status-filter').addEventListener('change', loadStudents);
    
    // Setup form submit
    document.getElementById('student-form').addEventListener('submit', handleFormSubmit);
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load classes for dropdowns
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        allClasses = await response.json();
        
        // Populate class filter dropdown
        const classFilter = document.getElementById('class-filter');
        allClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls._id;
            option.textContent = cls.name;
            classFilter.appendChild(option);
        });
        
        // Populate class select in form
        const classSelect = document.getElementById('classId');
        allClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls._id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading classes:', error);
        showAlert('Error loading classes', 'danger');
    }
}

// Load students
async function loadStudents() {
    try {
        const search = document.getElementById('search-input').value;
        const classId = document.getElementById('class-filter').value;
        const status = document.getElementById('status-filter').value;
        
        let url = '/api/students?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (classId) url += `classId=${classId}&`;
        if (status) url += `status=${status}`;
        
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch students');
        
        allStudents = await response.json();
        renderStudentTable();
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'danger');
    }
}

// Render student table
function renderStudentTable() {
    const tbody = document.getElementById('student-tbody');
    document.getElementById('student-count').textContent = `${allStudents.length} Students`;
    
    if (allStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allStudents.map(student => {
        return `
        <tr>
            <td><strong>${student.rollNumber || 'N/A'}</strong></td>
            <td>${student.firstName || ''} ${student.lastName || ''}</td>
            <td>${student.className || 'N/A'}</td>
            <td>${student.gender || 'N/A'}</td>
            <td>${formatDate(student.dateOfBirth)}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${student.guardianName || 'N/A'}</td>
            <td>
                <span class="badge bg-${getStatusColor(student.status)}">${student.status || 'active'}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewStudent('${student._id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editStudent('${student._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

// Get status color
function getStatusColor(status) {
    switch(status) {
        case 'active': return 'success';
        case 'inactive': return 'secondary';
        case 'transferred': return 'warning';
        default: return 'primary';
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
}

// View student
async function viewStudent(id) {
    try {
        const response = await fetch(`/api/students/${id}`, { credentials: 'include' });
        const student = await response.json();
        
        const content = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
                    <p><strong>Name:</strong> ${student.firstName} ${student.lastName}</p>
                    <p><strong>Gender:</strong> ${student.gender}</p>
                    <p><strong>Date of Birth:</strong> ${formatDate(student.dateOfBirth)}</p>
                    <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Class:</strong> ${student.className || 'N/A'}</p>
                    <p><strong>Admission Date:</strong> ${formatDate(student.admissionDate)}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(student.status)}">${student.status}</span></p>
                    <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
                </div>
            </div>
            <hr>
            <h6>Guardian Information</h6>
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Name:</strong> ${student.guardianName || 'N/A'}</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Phone:</strong> ${student.guardianPhone || 'N/A'}</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Relation:</strong> ${student.guardianRelation || 'N/A'}</p>
                </div>
            </div>
        `;
        
        document.getElementById('view-student-content').innerHTML = content;
        new bootstrap.Modal(document.getElementById('viewStudentModal')).show();
    } catch (error) {
        console.error('Error viewing student:', error);
        showAlert('Error loading student details', 'danger');
    }
}

// Edit student
async function editStudent(id) {
    try {
        const response = await fetch(`/api/students/${id}`, { credentials: 'include' });
        const student = await response.json();
        
        document.getElementById('student-id').value = student._id;
        document.getElementById('firstName').value = student.firstName || '';
        document.getElementById('lastName').value = student.lastName || '';
        document.getElementById('gender').value = student.gender || 'Male';
        document.getElementById('dateOfBirth').value = student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('classId').value = student.classId || '';
        document.getElementById('rollNumber').value = student.rollNumber || '';
        document.getElementById('admissionDate').value = student.admissionDate ? student.admissionDate.split('T')[0] : '';
        document.getElementById('guardianName').value = student.guardianName || '';
        document.getElementById('guardianPhone').value = student.guardianPhone || '';
        document.getElementById('guardianRelation').value = student.guardianRelation || 'Parent';
        
        document.getElementById('modalTitle').textContent = 'Edit Student';
        new bootstrap.Modal(document.getElementById('studentModal')).show();
    } catch (error) {
        console.error('Error loading student for edit:', error);
        showAlert('Error loading student details', 'danger');
    }
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('student-id').value;
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        gender: document.getElementById('gender').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        classId: document.getElementById('classId').value,
        rollNumber: document.getElementById('rollNumber').value,
        admissionDate: document.getElementById('admissionDate').value,
        guardianName: document.getElementById('guardianName').value,
        guardianPhone: document.getElementById('guardianPhone').value,
        guardianRelation: document.getElementById('guardianRelation').value
    };
    
    try {
        const url = studentId ? `/api/students/${studentId}` : '/api/students';
        const method = studentId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save student');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        showAlert('Student saved successfully', 'success');
        resetForm();
        loadStudents();
    } catch (error) {
        console.error('Error saving student:', error);
        showAlert(error.message, 'danger');
    }
}

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to delete student');
        
        showAlert('Student deleted successfully', 'success');
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showAlert('Error deleting student', 'danger');
    }
}

// Reset form
function resetForm() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Student';
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Reset form on modal close
document.getElementById('studentModal').addEventListener('hidden.bs.modal', resetForm);
