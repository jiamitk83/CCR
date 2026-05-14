let fees = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadFees();
    loadStudents();
});

// Load fees
async function loadFees() {
    try {
        const response = await fetch('/api/fees', { credentials: 'include' });
        fees = await response.json();
        
        // Load stats
        const statsResponse = await fetch('/api/fees/stats/summary', { credentials: 'include' });
        const stats = await statsResponse.json();
        
        document.getElementById('total-collected').textContent = '₹' + (stats.totalCollected || 0).toLocaleString();
        document.getElementById('total-pending').textContent = '₹' + (stats.totalPending || 0).toLocaleString();
        document.getElementById('pending-count').textContent = stats.pendingCount || 0;
        
        renderFeeTable();
    } catch (error) {
        console.error('Error loading fees:', error);
    }
}

// Load students for dropdown
async function loadStudents() {
    try {
        const response = await fetch('/api/students', { credentials: 'include' });
        const students = await response.json();
        
        const select = document.getElementById('fee-student');
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student._id;
            option.textContent = `${student.firstName} ${student.lastName} - ${student.rollNumber}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Render fee table
function renderFeeTable() {
    const tbody = document.getElementById('fee-tbody');
    
    if (fees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No fee records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = fees.map(fee => `
        <tr>
            <td><strong>${fee.rollNumber || 'N/A'}</strong></td>
            <td>${fee.studentName || 'N/A'}</td>
            <td>${fee.className || 'N/A'}</td>
            <td>${fee.feeType}</td>
            <td>₹${fee.amount}</td>
            <td>₹${fee.paidAmount || 0}</td>
            <td>${formatDate(fee.dueDate)}</td>
            <td>
                <span class="badge bg-${getStatusColor(fee.status)}">${fee.status || 'pending'}</span>
            </td>
            <td>
                ${fee.status !== 'paid' ? `
                <button class="btn btn-sm btn-success" onclick="openPaymentModal('${fee._id}', ${fee.amount - (fee.paidAmount || 0)})">
                    <i class="fas fa-rupee-sign"></i> Pay
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Get status color
function getStatusColor(status) {
    switch(status) {
        case 'paid': return 'success';
        case 'partial': return 'warning';
        case 'pending': return 'danger';
        default: return 'secondary';
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
}

// Open payment modal
function openPaymentModal(feeId, amount) {
    document.getElementById('payment-fee-id').value = feeId;
    document.getElementById('payment-amount').value = amount;
    new bootstrap.Modal(document.getElementById('paymentModal')).show();
}

// Handle form submissions
document.getElementById('fee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        studentId: document.getElementById('fee-student').value,
        classId: null, // Will be set from student
        feeType: document.getElementById('fee-type').value,
        amount: document.getElementById('fee-amount').value,
        dueDate: document.getElementById('fee-due-date').value
    };
    
    // Get student class
    const studentId = formData.studentId;
    const student = fees.find(f => f.studentId === studentId)?.studentId;
    
    try {
        const response = await fetch('/api/fees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to create fee');
        
        bootstrap.Modal.getInstance(document.getElementById('feeModal')).hide();
        e.target.reset();
        loadFees();
        alert('Fee created successfully');
    } catch (error) {
        console.error('Error creating fee:', error);
        alert('Error creating fee');
    }
});

document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const feeId = document.getElementById('payment-fee-id').value;
    const paidAmount = parseFloat(document.getElementById('payment-amount').value);
    const paymentMethod = document.getElementById('payment-method').value;
    
    try {
        const response = await fetch(`/api/fees/${feeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'paid', 
                paidAmount,
                paymentMethod 
            }),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to record payment');
        
        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
        e.target.reset();
        loadFees();
        alert('Payment recorded successfully');
    } catch (error) {
        console.error('Error recording payment:', error);
        alert('Error recording payment');
    }
});
