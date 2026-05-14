let timetable = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
});

// Load classes
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        const classes = await response.json();
        
        const select = document.getElementById('timetable-class');
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

// Load timetable
async function loadTimetable() {
    const classId = document.getElementById('timetable-class').value;
    const day = document.getElementById('timetable-day').value;
    
    if (!classId) {
        alert('Please select a class');
        return;
    }
    
    try {
        const response = await fetch(`/api/timetable/class/${classId}/${day}`, { credentials: 'include' });
        timetable = await response.json();
        renderTimetable();
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

// Render timetable
function renderTimetable() {
    const tbody = document.getElementById('timetable-body');
    
    if (timetable.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No timetable found</td></tr>';
        return;
    }
    
    tbody.innerHTML = timetable.map(period => `
        <tr>
            <td>${period.period || '-'}</td>
            <td>${period.startTime || '-'} - ${period.endTime || '-'}</td>
            <td>${period.subjectName || 'Break'}</td>
            <td>${period.teacherName || '-'}</td>
            <td>${period.room || '-'}</td>
        </tr>
    `).join('');
}
