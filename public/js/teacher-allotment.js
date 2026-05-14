const allotmentTbody = document.getElementById('allotment-tbody');
const classSelect = document.getElementById('class-select');
const subjectSelect = document.getElementById('subject-select');
const teacherSelect = document.getElementById('teacher-select');
const allotBtn = document.getElementById('allot-btn');

let allotments = [];
let classes = [];
let teachers = [];

async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        classes = await response.json();
        classSelect.innerHTML = '<option value="">Select Class</option>' + 
            classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers', { credentials: 'include' });
        teachers = await response.json();
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>' + 
            teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

async function loadAllotments() {
    try {
        const response = await fetch('/api/teacher-allotments', { credentials: 'include' });
        allotments = await response.json();
        renderAllotments();
    } catch (error) {
        console.error('Error loading allotments:', error);
    }
}

function renderAllotments() {
    allotmentTbody.innerHTML = '';
    allotments.forEach((allotment) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${allotment.className}</td>
            <td>${allotment.subjectName}</td>
            <td>${allotment.teacherName}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${allotment._id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        allotmentTbody.appendChild(tr);
    });
}

// Cascade: Load subjects when class is selected
classSelect.addEventListener('change', async () => {
    const className = classSelect.value;
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    
    if (className) {
        subjectSelect.disabled = false;
        try {
            // Load all subjects for the subject dropdown
            const response = await fetch('/api/subjects', { credentials: 'include' });
            const subjects = await response.json();
            subjectSelect.innerHTML = '<option value="">Select Subject</option>' + 
                subjects.map(s => `<option value="${s}">${s}</option>`).join('');
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    } else {
        subjectSelect.disabled = true;
    }
});

// Allot teacher
allotBtn.addEventListener('click', async () => {
    const className = classSelect.value;
    const subjectName = subjectSelect.value;
    const teacherName = teacherSelect.value;

    if (className && subjectName && teacherName) {
        // Check if allotment already exists
        const existing = allotments.find(a => 
            a.className === className && 
            a.subjectName === subjectName && 
            a.teacherName === teacherName
        );
        
        if (existing) {
            alert('This teacher is already allotted to this class and subject');
            return;
        }

        try {
            const response = await fetch('/api/teacher-allotments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ className, subjectName, teacherName })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save allotment');
            }
            
            // Reset form
            classSelect.value = '';
            subjectSelect.value = '';
            subjectSelect.disabled = true;
            teacherSelect.value = '';
            
            loadAllotments();
        } catch (error) {
            console.error('Error allotting teacher:', error);
            alert('Error saving allotment. Please make sure you are logged in.');
        }
    } else {
        alert('Please fill in all fields');
    }
});

// Delete allotment
allotmentTbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('delete-btn')) {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this allotment?')) {
            try {
                await fetch(`/api/teacher-allotments/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                loadAllotments();
            } catch (error) {
                console.error('Error deleting allotment:', error);
            }
        }
    }
});

// Initialize
loadClasses();
loadTeachers();
loadAllotments();
