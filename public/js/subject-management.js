const subjectList = document.getElementById('subject-list');
const subjectNameInput = document.getElementById('subject-name');
const addBtn = document.getElementById('add-btn');
const loadDataBtn = document.getElementById('load-data-btn');

let subjects = [];

async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects', { credentials: 'include' });
        subjects = await response.json();
        renderSubjects();
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function loadData() {
    try {
        const response = await fetch('../temp_update.json');
        subjects = await response.json();
        renderSubjects();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function renderSubjects() {
    subjectList.innerHTML = '';
    subjects.forEach((subject, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${subject.name || subject}</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-index="${index}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        subjectList.appendChild(li);
    });
}

// Add subject
addBtn.addEventListener('click', async () => {
    const name = subjectNameInput.value.trim();
    if (name) {
        try {
            const response = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name })
            });
            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Failed to add subject');
                return;
            }
            subjectNameInput.value = '';
            loadSubjects();
        } catch (error) {
            console.error('Error adding subject:', error);
            alert('Error adding subject');
        }
    }
});

// Edit and Delete
subjectList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const index = btn.dataset.index;
    const subjectName = subjects[index].name || subjects[index];

    if (btn.classList.contains('edit-btn')) {
        const li = btn.closest('li');
        const span = li.querySelector('span');
        const currentName = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'form-control edit-input';
        li.replaceChild(input, span);
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        btn.classList.remove('edit-btn');
        btn.classList.add('save-btn');
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
    } else if (btn.classList.contains('save-btn')) {
        const li = btn.closest('li');
        const input = li.querySelector('.edit-input');
        const newName = input.value.trim();
        if (newName) {
            try {
                await fetch(`/api/subjects/${subjectName}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: newName })
                });
                loadSubjects();
            } catch (error) {
                console.error('Error updating subject:', error);
            }
        }
    } else if (btn.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await fetch(`/api/subjects/${subjectName}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                loadSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    }
});
loadDataBtn.addEventListener('click', loadData);

// Initial load
loadSubjects();
