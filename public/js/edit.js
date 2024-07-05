// Function to fetch data with token
async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    const headers = options.headers || {};
    headers['authorization'] = token;
    options.headers = headers;

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

// Event listener for the edit form submission
document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const formData = new FormData(this);
        const response = await fetchWithToken(`/user/${formData.get('id')}?_method=PATCH`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password')
            })
        });

        // Handle response
        if (response.ok) {
            window.location.href = '/login?message=Username updated. Please login again.';
        } else {
            const data = await response.json();
            alert(data.message || 'Update Failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating user. Please try again.');
    }
});
