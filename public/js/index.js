async function calculateStats() {
    try {
        const [
            studentsResponse, classesResponse, subjectsResponse, 
            teachersResponse, allChaptersResponse, allStatusResponse,
            feesResponse, noticesResponse
        ] = await Promise.all([
            fetch('/api/students', { credentials: 'include' }),
            fetch('/api/classes', { credentials: 'include' }),
            fetch('/api/subjects', { credentials: 'include' }),
            fetch('/api/teachers', { credentials: 'include' }),
            fetch('/api/chapters/all-chapters', { credentials: 'include' }),
            fetch('/api/status/all-status', { credentials: 'include' }),
            fetch('/api/fees/stats/summary', { credentials: 'include' }),
            fetch('/api/notices/active', { credentials: 'include' })
        ]);

        const students = await studentsResponse.json();
        const classes = await classesResponse.json();
        const subjects = await subjectsResponse.json();
        const teachers = await teachersResponse.json();
        const allChapters = await allChaptersResponse.json();
        const allStatus = await allStatusResponse.json();
        const fees = await feesResponse.json();
        const notices = await noticesResponse.json();

        // Update basic stats
        document.getElementById('total-students').textContent = students.length || 0;
        document.getElementById('total-classes').textContent = classes.length || 0;
        document.getElementById('total-subjects').textContent = subjects.length || 0;
        document.getElementById('total-teachers').textContent = teachers.length || 0;

        // Calculate course completion
        let totalCompleted = 0;
        const statusMap = {};
        allStatus.forEach(s => {
            const key = `${s.className}-${s.subjectName}-${s.chapterNumber}`;
            statusMap[key] = s;
            if (s.chapterCompleted) totalCompleted++;
        });

        const overallRate = allChapters.length > 0 ? Math.round((totalCompleted / allChapters.length) * 100) : 0;
        document.getElementById('completion-rate').textContent = overallRate + '%';

        // Update fee stats
        document.getElementById('fee-collection').textContent = '₹' + (fees.totalCollected || 0).toLocaleString();

        // Update notices count
        document.getElementById('active-notices').textContent = notices.length || 0;

        // Attendance placeholder - would need class selection for real data
        document.getElementById('today-attendance').textContent = '--';

        // Render course completion table
        const tbody = document.getElementById('report-tbody');
        tbody.innerHTML = '';

        const grouped = {};
        allChapters.forEach(chap => {
            const key = `${chap.className}-${chap.subjectName}`;
            if (!grouped[key]) grouped[key] = { className: chap.className, subjectName: chap.subjectName, chapters: [] };
            grouped[key].chapters.push(chap);
        });

        Object.values(grouped).forEach(group => {
            const chapList = group.chapters;
            let completed = 0;
            chapList.forEach(chap => {
                const key = `${group.className}-${group.subjectName}-${chap.chapterNumber}`;
                if (statusMap[key] && statusMap[key].chapterCompleted) completed++;
            });
            const percentage = chapList.length > 0 ? Math.round((completed / chapList.length) * 100) : 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="fw-bold">${group.className}</span></td>
                <td>${group.subjectName}</td>
                <td>${chapList.length}</td>
                <td>${completed}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <span>${percentage}%</span>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Initialize
calculateStats();
