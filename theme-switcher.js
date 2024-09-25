// Function to set a given theme/color-scheme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
}

// Function to toggle between light and dark theme
function toggleTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// Function to get the user's theme preference
function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Function to set the initial theme
function setInitialTheme() {
    const theme = getThemePreference();
    setTheme(theme);
    document.getElementById('checkbox').checked = theme === 'dark';
}

// Event listener for the theme toggle
document.addEventListener('DOMContentLoaded', () => {
    setInitialTheme();
    document.getElementById('checkbox').addEventListener('change', toggleTheme);
});
