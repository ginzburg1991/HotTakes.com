document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const response = await fetch('/login', {
            method: 'POST',
            body: new URLSearchParams(formData)
        });

        if (response.ok) {
            const username = formData.get('username');
            localStorage.setItem('loggedInUser', username);
            alert('Login successful');
            window.location.href = '/home';
        } else {
            alert('Login failed');
        }
    });
});