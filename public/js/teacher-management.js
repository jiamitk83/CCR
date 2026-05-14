const teacherTbody = document.getElementById('teacher-tbody');
const teacherNameInput = document.getElementById('teacher-name');
const addBtn = document.getElementById('add-btn');

let teachers = [];

async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers', { credentials: 'include' });
        teachers = await response.json();
        renderTeachers();
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function renderTeachers() {
    teacherTbody.innerHTML = '';
    teachers.forEach((teacher) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.name}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-btn me-2" data-id="${teacher._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${teacher._id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        teacherTbody.appendChild(tr);
    });
}

// Add teacher
addBtn.addEventListener('click', async () => {
    const name = teacherNameInput.value.trim();

    if (name) {
        try {
            await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name })
            });
            teacherNameInput.value = '';
            loadTeachers();
        } catch (error) {
            console.error('Error adding teacher:', error);
        }
    } else {
        alert('Please enter teacher name');
    }
});

// Edit and Delete
teacherTbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;

    if (btn.classList.contains('edit-btn')) {
        const tr = btn.closest('tr');
        const tds = tr.querySelectorAll('td');
        const currentName = tds[0].textContent;

        tds[0].innerHTML = `<input type="text" class="form-control form-control-sm edit-input" value="${currentName}">`;

        const actionTd = tds[1];
        actionTd.innerHTML = `
            <button class="btn btn-sm btn-success save-btn me-2" data-id="${id}"><i class="fas fa-save"></i> Save</button>
            <button class="btn btn-sm btn-secondary cancel-btn"><i class="fas fa-times"></i> Cancel</button>
        `;

    } else if (btn.classList.contains('save-btn')) {
        const tr = btn.closest('tr');
        const input = tr.querySelector('.edit-input');
        const newName = input.value.trim();

        if (newName) {
            try {
                await fetch(`/api/teachers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: newName })
                });
                loadTeachers();
            } catch (error) {
                console.error('Error updating teacher:', error);
            }
        }
    } else if (btn.classList.contains('cancel-btn')) {
        loadTeachers();
    } else if (btn.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this teacher?')) {
            try {
                await fetch(`/api/teachers/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                loadTeachers();
            } catch (error) {
                console.error('Error deleting teacher:', error);
            }
        }
    }
});

// Initialize
loadTeachers();
