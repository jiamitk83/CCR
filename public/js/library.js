let books = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    loadStats();
});

// Load books
async function loadBooks() {
    try {
        const response = await fetch('/api/library/books', { credentials: 'include' });
        books = await response.json();
        renderBooks();
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/library/stats', { credentials: 'include' });
        const stats = await response.json();
        
        document.getElementById('total-books').textContent = stats.totalBooks || 0;
        document.getElementById('available-books').textContent = stats.availableBooks || 0;
        document.getElementById('issued-books').textContent = stats.issuedBooks || 0;
        document.getElementById('overdue-books').textContent = stats.overdueBooks || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render books
function renderBooks() {
    const tbody = document.getElementById('book-tbody');
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No books found</td></tr>';
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr>
            <td><strong>${book.title}</strong></td>
            <td>${book.author || 'N/A'}</td>
            <td>${book.isbn || '-'}</td>
            <td>${book.category || '-'}</td>
            <td>
                <span class="badge bg-${book.available ? 'success' : 'warning'}">
                    ${book.available ? 'Available' : 'Issued'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Handle book form submission
document.getElementById('book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        isbn: document.getElementById('book-isbn').value,
        category: document.getElementById('book-category').value
    };
    
    try {
        const response = await fetch('/api/library/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to add book');
        
        bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
        e.target.reset();
        loadBooks();
        loadStats();
        alert('Book added successfully');
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Error adding book');
    }
});
