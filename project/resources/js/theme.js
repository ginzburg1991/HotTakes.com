window.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('themeToggle');
    const body = document.getElementById('dark-mode');

    
    const storedTheme = localStorage.getItem('colorTheme');
    if (storedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
    }

    
    themeToggleButton.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('colorTheme', body.classList.contains('dark-mode') ? 'dark-mode' : 'default');
    });
});