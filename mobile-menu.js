document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        navUl.classList.toggle('show');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            navUl.classList.remove('show');
        });
    });
});
