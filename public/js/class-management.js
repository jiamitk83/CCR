const classList = document.getElementById('class-list');
const classNameInput = document.getElementById('class-name');
const addBtn = document.getElementById('add-btn');

let classes = [];

// Note: Subject selection was removed from UI but kept in API

// Load classes only - subjects removed from UI
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        classes = await response.json();
        renderClasses();
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function renderClasses() {
    classList.innerHTML = '';
    classes.forEach((classItem, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const subjectsDisplay = classItem.subjects && classItem.subjects.length > 0 
            ? `<small class="text-muted ms-2">[${classItem.subjects.join(', ')}]</small>` 
            : '<small class="text-muted ms-2">(No subjects)</small>';
        
        li.innerHTML = `
            <span>${classItem.name} ${subjectsDisplay}</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-index="${index}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        classList.appendChild(li);
    });
}

// Add class
addBtn.addEventListener('click', async () => {
    const name = classNameInput.value.trim();
    
    if (name) {
        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name })
            });
            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Failed to add class');
                return;
            }
            classNameInput.value = '';
            loadClasses();
        } catch (error) {
            console.error('Error adding class:', error);
            alert('Error adding class');
        }
    }
});

// Edit and Delete
classList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const index = btn.dataset.index;
    const classItem = classes[index];
    const oldName = typeof classItem === 'object' ? classItem.name : classItem;

    if (btn.classList.contains('edit-btn')) {
        const li = btn.closest('li');
        const span = li.querySelector('span');
        
        const currentName = typeof classItem === 'object' ? classItem.name : classItem;
        
        const editDiv = document.createElement('div');
        editDiv.className = 'd-flex align-items-center w-100';
        editDiv.innerHTML = `
            <input type="text" class="form-control me-2 edit-name-input" value="${currentName}" placeholder="Class name">
        `;
        
        li.replaceChild(editDiv, span);
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        btn.classList.remove('edit-btn');
        btn.classList.add('save-btn');
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
    } else if (btn.classList.contains('save-btn')) {
        const li = btn.closest('li');
        const nameInput = li.querySelector('.edit-name-input');
        const newName = nameInput.value.trim();
        
        if (newName) {
            try {
                await fetch(`/api/classes/${oldName}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: newName })
                });
                loadClasses();
            } catch (error) {
                console.error('Error updating class:', error);
            }
        }
    } else if (btn.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this class?')) {
            try {
                await fetch(`/api/classes/${oldName}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                loadClasses();
            } catch (error) {
                console.error('Error deleting class:', error);
            }
        }
    }
});

// Initial load
loadClasses();
