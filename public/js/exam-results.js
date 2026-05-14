let exams = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadExams();
    loadClasses();
    loadSubjects();
});

// Load exams
async function loadExams() {
    try {
        const response = await fetch('/api/exams', { credentials: 'include' });
        exams = await response.json();
        renderExamTable();
        
        // Populate exam select dropdown
        const select = document.getElementById('result-exam-select');
        exams.forEach(exam => {
            const option = document.createElement('option');
            option.value = exam._id;
            option.textContent = `${exam.title} - ${exam.className} - ${exam.subjectName}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

// Load classes
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        const classes = await response.json();
        
        const select = document.getElementById('exam-class');
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
        
        const select = document.getElementById('exam-subject');
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

// Render exam table
function renderExamTable() {
    const tbody = document.getElementById('exam-tbody');
    
    if (exams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No exams found</td></tr>';
        return;
    }
    
    tbody.innerHTML = exams.map(exam => `
        <tr>
            <td><strong>${exam.title}</strong></td>
            <td>${exam.className || 'N/A'}</td>
            <td>${exam.subjectName || 'N/A'}</td>
            <td>${formatDate(exam.date)}</td>
            <td>${exam.examType || 'Written'}</td>
            <td>${exam.totalMarks || 100}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="loadExamResults('${exam._id}')">
                    <i class="fas fa-eye"></i> Results
                </button>
            </td>
        </tr>
    `).join('');
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
}

// Load results for selected exam
async function loadResults() {
    const examId = document.getElementById('result-exam-select').value;
    if (!examId) {
        alert('Please select an exam');
        return;
    }
    loadExamResults(examId);
}

// Load exam results
async function loadExamResults(examId) {
    try {
        const response = await fetch(`/api/exams/${examId}/results`, { credentials: 'include' });
        const results = await response.json();
        
        renderResultsTable(results);
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Render results table
function renderResultsTable(results) {
    const tbody = document.getElementById('result-tbody');
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No results found</td></tr>';
        return;
    }
    
    tbody.innerHTML = results.map(result => `
        <tr>
            <td><strong>${result.rollNumber || 'N/A'}</strong></td>
            <td>${result.studentName || 'N/A'}</td>
            <td>${result.marks || 0}</td>
            <td>${result.grade || '-'}</td>
            <td>
                <span class="badge bg-${result.marks >= 35 ? 'success' : 'danger'}">
                    ${result.marks >= 35 ? 'Pass' : 'Fail'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Handle exam form submission
document.getElementById('exam-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('exam-title').value,
        classId: document.getElementById('exam-class').value,
        subjectId: document.getElementById('exam-subject').value,
        examType: document.getElementById('exam-type').value,
        date: document.getElementById('exam-date').value,
        totalMarks: document.getElementById('exam-total-marks').value,
        passingMarks: document.getElementById('exam-passing-marks').value
    };
    
    try {
        const response = await fetch('/api/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to create exam');
        
        bootstrap.Modal.getInstance(document.getElementById('examModal')).hide();
        e.target.reset();
        loadExams();
        alert('Exam created successfully');
    } catch (error) {
        console.error('Error creating exam:', error);
        alert('Error creating exam');
    }
});
