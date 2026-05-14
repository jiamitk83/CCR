const classSelect = document.getElementById('class-select');
const subjectSelect = document.getElementById('subject-select');
const addChapterDiv = document.getElementById('add-chapter-div');
const chapterTable = document.getElementById('chapter-table');
const tbody = document.getElementById('chapter-list');
const chapterNumberInput = document.getElementById('chapter-number');
const chapterNameInput = document.getElementById('chapter-name');
const startMonthSelect = document.getElementById('start-month');
const endMonthSelect = document.getElementById('end-month');
const addBtn = document.getElementById('add-btn');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthOptions(selected = null) {
    return monthNames.map((m, i) => `<option value="${i + 1}" ${selected === i + 1 ? 'selected' : ''}>${m}</option>`).join('');
}

// Populate Month Selects
startMonthSelect.innerHTML = '<option value="">Select Month</option>' + monthOptions();
endMonthSelect.innerHTML = '<option value="">Select Month</option>' + monthOptions();

async function populateClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        const classes = await response.json();
        classSelect.innerHTML = '<option value="">Select Class</option>' + classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function populateSubjects() {
    try {
        const response = await fetch('/api/subjects', { credentials: 'include' });
        const subjects = await response.json();
        subjectSelect.innerHTML = '<option value="">Select Subject</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function renderChapters() {
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    tbody.innerHTML = '';

    if (selectedClass && selectedSubject) {
        chapterTable.style.display = 'block';
        try {
            const response = await fetch(`/api/chapters/${selectedClass}/${selectedSubject}`, { credentials: 'include' });
            const chapters = await response.json();

            // Sort by chapter number
            chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

            let maxChapter = 0;
            chapters.forEach(chapter => {
                if (chapter.chapterNumber > maxChapter) maxChapter = chapter.chapterNumber;
                const tr = document.createElement('tr');
                tr.setAttribute('data-chapter', JSON.stringify(chapter));
                tr.innerHTML = `
                    <td>${chapter.chapterNumber}</td>
                    <td>${chapter.name}</td>
                    <td><span class="badge bg-light text-dark border">${monthNames[chapter.startMonth - 1]}</span></td>
                    <td><span class="badge bg-light text-dark border">${monthNames[chapter.endMonth - 1]}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary action-btn me-2 edit-btn" data-id="${chapter._id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-sm btn-outline-danger action-btn delete-btn" data-id="${chapter._id}"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Auto-fill next chapter number
            chapterNumberInput.value = maxChapter + 1;

        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    } else {
        chapterTable.style.display = 'none';
    }
}

classSelect.addEventListener('change', () => {
    subjectSelect.disabled = !classSelect.value;
    if (!classSelect.value) {
        subjectSelect.value = '';
        addChapterDiv.style.display = 'none';
    }
    renderChapters();
});

subjectSelect.addEventListener('change', () => {
    addChapterDiv.style.display = subjectSelect.value ? 'block' : 'none';
    renderChapters();
});

addBtn.addEventListener('click', async () => {
    const number = parseInt(chapterNumberInput.value);
    const name = chapterNameInput.value.trim();
    const start = parseInt(startMonthSelect.value);
    const end = parseInt(endMonthSelect.value);
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    if (number && name && start && end && start <= end && selectedClass && selectedSubject) {
        try {
            await fetch('/api/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ chapterNumber: number, name, startMonth: start, endMonth: end, className: selectedClass, subjectName: selectedSubject })
            });
            chapterNumberInput.value = '';
            chapterNameInput.value = '';
            startMonthSelect.value = '';
            endMonthSelect.value = '';
            renderChapters();
        } catch (error) {
            console.error('Error adding chapter:', error);
        }
    }
});

chapterTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;

    if (btn.classList.contains('edit-btn')) {
        const tr = btn.closest('tr');
        const chapter = JSON.parse(tr.getAttribute('data-chapter'));
        const tds = tr.querySelectorAll('td');
        tds[0].innerHTML = `<input type="number" class="form-control form-control-sm edit-input" value="${chapter.chapterNumber}">`;
        tds[1].innerHTML = `<input type="text" class="form-control form-control-sm edit-input" value="${chapter.name}">`;
        tds[2].innerHTML = `<select class="form-select form-select-sm edit-input">${monthOptions(chapter.startMonth)}</select>`;
        tds[3].innerHTML = `<select class="form-select form-select-sm edit-input">${monthOptions(chapter.endMonth)}</select>`;
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
        btn.classList.remove('me-2');
        btn.classList.remove('edit-btn');
        btn.classList.add('save-btn');
    } else if (btn.classList.contains('save-btn')) {
        const tr = btn.closest('tr');
        const inputs = tr.querySelectorAll('.edit-input');
        const newNumber = parseInt(inputs[0].value);
        const newName = inputs[1].value.trim();
        const newStart = parseInt(inputs[2].value);
        const newEnd = parseInt(inputs[3].value);
        if (newNumber && newName && newStart && newEnd && newStart <= newEnd) {
            try {
                await fetch(`/api/chapters/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ chapterNumber: newNumber, name: newName, startMonth: newStart, endMonth: newEnd, className: selectedClass, subjectName: selectedSubject })
                });
                renderChapters();
            } catch (error) {
                console.error('Error updating chapter:', error);
            }
        }
    } else if (btn.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this chapter?')) {
            try {
                await fetch(`/api/chapters/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                renderChapters();
            } catch (error) {
                console.error('Error deleting chapter:', error);
            }
        }
    }
});

// Initialize
populateClasses();
populateSubjects();
