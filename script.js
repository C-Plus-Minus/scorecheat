// script.js
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    const messageArea = document.getElementById('message-area');

    // Wait for the DOM to be ready, then attach the basic click listener.
    button.addEventListener('click', () => {
        alert('Success! The button click event was captured successfully.');
        messageArea.textContent = 'Script status: Button clicked successfully! The PWA scaffolding is working.';
    });
});