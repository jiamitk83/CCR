const classSelect = document.getElementById('class-select');
const subjectSelect = document.getElementById('subject-select');
const statusTable = document.getElementById('status-table');
const statusTbody = document.getElementById('status-tbody');

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

async function renderStatus() {
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    statusTbody.innerHTML = '';

    if (selectedClass && selectedSubject) {
        statusTable.style.display = 'table';
        try {
            const [chaptersResponse, statusResponse] = await Promise.all([
                fetch(`/api/chapters/${selectedClass}/${selectedSubject}`, { credentials: 'include' }),
                fetch(`/api/status/${selectedClass}/${selectedSubject}`, { credentials: 'include' })
            ]);

            if (!chaptersResponse.ok) {
                throw new Error('Failed to load chapters');
            }
            
            const chapters = await chaptersResponse.json();
            const statusData = await statusResponse.json();

            // Convert statusMap object to array if needed
            let statuses = [];
            if (Array.isArray(statusData)) {
                statuses = statusData;
            } else if (statusData && typeof statusData === 'object') {
                // Convert object back to array
                statuses = Object.values(statusData);
            }

            // Sort chapters
            chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

            // Create a map for easy status lookup
            const statusMap = {};
            statuses.forEach(s => statusMap[s.chapterNumber] = s);

            chapters.forEach(chap => {
                const status = statusMap[chap.chapterNumber] || {};
                const tr = document.createElement('tr');
                tr.setAttribute('data-chapter', JSON.stringify(chap));
                tr.innerHTML = `
                    <td>${chap.chapterNumber}</td>
                    <td>${chap.name}</td>
                    <td class="text-center"><input type="checkbox" class="form-check-input status-checkbox" data-type="chapterCompleted" data-chapter="${chap.chapterNumber}" ${status.chapterCompleted ? 'checked' : ''}></td>
                    <td class="text-center"><input type="checkbox" class="form-check-input status-checkbox" data-type="notebookCompleted" data-chapter="${chap.chapterNumber}" ${status.notebookCompleted ? 'checked' : ''}></td>
                    <td class="text-center"><input type="checkbox" class="form-check-input status-checkbox" data-type="worksheetCompleted" data-chapter="${chap.chapterNumber}" ${status.worksheetCompleted ? 'checked' : ''}></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-btn me-2"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                statusTbody.appendChild(tr);
            });

        } catch (error) {
            console.error('Error loading status:', error);
            alert('Error loading status: ' + error.message);
        }
    } else {
        statusTable.style.display = 'none';
    }
}

classSelect.addEventListener('change', () => {
    subjectSelect.disabled = !classSelect.value;
    if (!classSelect.value) subjectSelect.value = '';
    renderStatus();
});

subjectSelect.addEventListener('change', renderStatus);

// Handle Checkbox Changes (Auto-save)
statusTbody.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-checkbox')) {
        const checkbox = e.target;
        const chapterNumber = parseInt(checkbox.dataset.chapter);
        const type = checkbox.dataset.type;
        const checked = checkbox.checked;
        const selectedClass = classSelect.value;
        const selectedSubject = subjectSelect.value;

        try {
            await fetch(`/api/status/${selectedClass}/${selectedSubject}/${chapterNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    [type]: checked
                })
            });
            // Optional: Show a small toast or indicator that save was successful
        } catch (error) {
            console.error('Error saving status:', error);
            // Revert checkbox if failed
            checkbox.checked = !checked;
            alert('Failed to save status. Please try again.');
        }
    }
});

// Edit and Delete Chapter from Status Page
statusTbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const tr = btn.closest('tr');
    const chapterNumber = parseInt(tr.querySelector('td').textContent);
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;

    if (btn.classList.contains('edit-btn')) {
        const chapter = JSON.parse(tr.getAttribute('data-chapter'));
        const tds = tr.querySelectorAll('td');
        tds[0].innerHTML = `<input type="number" class="form-control form-control-sm" value="${chapter.chapterNumber}" style="width: 60px;">`;
        tds[1].innerHTML = `<input type="text" class="form-control form-control-sm" value="${chapter.name}">`;
        
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        btn.classList.remove('edit-btn', 'btn-outline-primary');
        btn.classList.add('save-btn', 'btn-success');

    } else if (btn.classList.contains('save-btn')) {
        const inputs = tr.querySelectorAll('input[type="number"], input[type="text"]');
        const newNumber = parseInt(inputs[0].value);
        const newName = inputs[1].value.trim();
        if (newNumber && newName) {
            // Update chapter in database
            const chapter = JSON.parse(tr.getAttribute('data-chapter'));
            try {
                await fetch(`/api/chapters/${chapter._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ chapterNumber: newNumber, name: newName, startMonth: chapter.startMonth, endMonth: chapter.endMonth, className: selectedClass, subjectName: selectedSubject })
                });
                renderStatus(); // Re-render to show updated data
            } catch (error) {
                console.error('Error updating chapter:', error);
            }
        }
    } else if (e.target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this status?')) {
            try {
                await fetch(`/api/status/${selectedClass}/${selectedSubject}/${chapterNumber}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                renderStatus(); // Re-render
            } catch (error) {
                console.error('Error deleting status:', error);
            }
        }
    }
});

document.getElementById('generate-pdf-btn').addEventListener('click', generatePDF);

// Submit Button - Save all status at once
document.getElementById('submit-btn').addEventListener('click', async () => {
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    
    if (!selectedClass || !selectedSubject) {
        alert('Please select a class and subject first.');
        return;
    }
    
    const rows = statusTbody.querySelectorAll('tr');
    if (rows.length === 0) {
        alert('No chapters to submit.');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
        const checkboxes = row.querySelectorAll('.status-checkbox');
        const chapterNumber = parseInt(checkboxes[0].dataset.chapter);
        
        const chapterCompleted = checkboxes[0].checked;
        const notebookCompleted = checkboxes[1].checked;
        const worksheetCompleted = checkboxes[2].checked;
        
        try {
            const response = await fetch(`/api/status/${selectedClass}/${selectedSubject}/${chapterNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    chapterCompleted,
                    notebookCompleted,
                    worksheetCompleted
                })
            });
            if (response.ok) {
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error('Error saving chapter ' + chapterNumber + ':', error);
            errorCount++;
        }
    }
    
    if (errorCount === 0) {
        alert('Status submitted successfully for ' + successCount + ' chapters!');
    } else {
        alert('Submitted ' + successCount + ' chapters. ' + errorCount + ' failed.');
    }
});

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    if (!selectedClass || !selectedSubject) {
        alert('Please select a class and subject first.');
        return;
    }
    doc.text(`Status Report - Class: ${selectedClass}, Subject: ${selectedSubject}`, 14, 20);
    const tableData = [];
    const rows = statusTbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [
            cells[0].textContent,
            cells[1].textContent,
            cells[2].querySelector('input').checked ? 'Yes' : 'No',
            cells[3].querySelector('input').checked ? 'Yes' : 'No',
            cells[4].querySelector('input').checked ? 'Yes' : 'No'
        ];
        tableData.push(rowData);
    });
    doc.autoTable({
        head: [['Chapter No.', 'Chapter Name', 'Chapter Completion', 'Notebook Completion', 'Worksheet Completed']],
        body: tableData,
        startY: 30
    });
    doc.save(`status-report-${selectedClass}-${selectedSubject}.pdf`);
}

// Mark All Button Logic
document.addEventListener('click', (e) => {
    if (e.target.closest('#mark-all-btn')) {
        const checkboxes = statusTbody.querySelectorAll('.status-checkbox');
        checkboxes.forEach(cb => cb.checked = true);
    }
});

// Initialize
populateClasses();
populateSubjects();
