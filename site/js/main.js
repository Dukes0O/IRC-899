// Main application logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Initialize navigation
    if (typeof Navigation !== 'undefined' && Navigation.init) {
        Navigation.init();
    } else {
        console.error('Navigation module not found or init function missing.');
    }

    // Initialize calculator if on the calculator page
    // This might be better handled by the navigation module loading page-specific scripts
    if (document.getElementById('impact-estimator-form') && typeof Calculator !== 'undefined' && Calculator.init) {
        Calculator.init();
    } 

    // Example: Load initial page content (e.g., homepage)
    // This is largely handled by navigation.js based on the hash or default path
    // if (typeof Navigation !== 'undefined' && Navigation.loadContent) {
    //     Navigation.loadContent(window.location.hash || '#home');
    // }

    console.log('Section 899 Educational Tool Initialized');
});
