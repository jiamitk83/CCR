let students = [];
let currentAttendance = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
    
    // Set today's date
    document.getElementById('date-select').value = new Date().toISOString().split('T')[0];
});

// Load classes
async function loadClasses() {
    try {
        const response = await fetch('/api/classes', { credentials: 'include' });
        const classes = await response.json();
        
        const select = document.getElementById('class-select');
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

// Load attendance for selected class and date
async function loadAttendance() {
    const classId = document.getElementById('class-select').value;
    const date = document.getElementById('date-select').value;
    
    if (!classId || !date) {
        alert('Please select class and date');
        return;
    }
    
    try {
        // Load students
        const response = await fetch(`/api/students?classId=${classId}`, { credentials: 'include' });
        students = await response.json();
        
        // Load existing attendance
        const attendanceResponse = await fetch(`/api/attendance/class/${classId}?date=${date}`, { credentials: 'include' });
        const attendanceRecords = await attendanceResponse.json();
        
        // Build attendance map
        currentAttendance = {};
        attendanceRecords.forEach(record => {
            currentAttendance[record.studentId] = record;
        });
        
        renderAttendanceTable();
        
        document.getElementById('attendance-card').style.display = 'block';
        document.getElementById('attendance-stats').style.display = 'flex';
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-tbody');
    let present = 0, absent = 0, late = 0;
    
    tbody.innerHTML = students.map(student => {
        const record = currentAttendance[student._id];
        const status = record?.status || 'present';
        const remark = record?.remark || '';
        
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'late') late++;
        
        return `
        <tr>
            <td><strong>${student.rollNumber}</strong></td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>
                <select class="form-select status-select" data-student-id="${student._id}" onchange="updateStatus('${student._id}', this.value)">
                    <option value="present" ${status === 'present' ? 'selected' : ''}>Present</option>
                    <option value="absent" ${status === 'absent' ? 'selected' : ''}>Absent</option>
                    <option value="late" ${status === 'late' ? 'selected' : ''}>Late</option>
                    <option value="excused" ${status === 'excused' ? 'selected' : ''}>Excused</option>
                </select>
            </td>
            <td>
                <input type="text" class="form-control remark-input" data-student-id="${student._id}" 
                    value="${remark}" placeholder="Add remark..." onchange="updateRemark('${student._id}', this.value)">
            </td>
        </tr>
        `;
    }).join('');
    
    // Update stats
    document.getElementById('present-count').textContent = present;
    document.getElementById('absent-count').textContent = absent;
    document.getElementById('late-count').textContent = late;
    
    const total = students.length;
    const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0;
    document.getElementById('attendance-percentage').textContent = percentage + '%';
}

// Update status in memory
function updateStatus(studentId, status) {
    if (!currentAttendance[studentId]) {
        currentAttendance[studentId] = { studentId, status: 'present', remark: '' };
    }
    currentAttendance[studentId].status = status;
    calculateStats();
}

// Update remark in memory
function updateRemark(studentId, remark) {
    if (!currentAttendance[studentId]) {
        currentAttendance[studentId] = { studentId, status: 'present', remark: '' };
    }
    currentAttendance[studentId].remark = remark;
}

// Calculate stats from currentAttendance
function calculateStats() {
    let present = 0, absent = 0, late = 0;
    
    Object.values(currentAttendance).forEach(record => {
        if (record.status === 'present') present++;
        else if (record.status === 'absent') absent++;
        else if (record.status === 'late') late++;
    });
    
    document.getElementById('present-count').textContent = present;
    document.getElementById('absent-count').textContent = absent;
    document.getElementById('late-count').textContent = late;
    
    const total = students.length;
    const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0;
    document.getElementById('attendance-percentage').textContent = percentage + '%';
}

// Save attendance
async function saveAttendance() {
    const classId = document.getElementById('class-select').value;
    const date = document.getElementById('date-select').value;
    
    if (!classId || !date) {
        alert('Please select class and date');
        return;
    }
    
    const attendanceRecords = Object.values(currentAttendance).map(record => ({
        studentId: record.studentId,
        status: record.status,
        remark: record.remark || ''
    }));
    
    try {
        const response = await fetch('/api/attendance/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId, date, attendanceRecords }),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to save attendance');
        
        alert('Attendance saved successfully');
    } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Error saving attendance');
    }
}
