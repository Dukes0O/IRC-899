/**
 * Demo script showing how to use the LegislationSummary class
 * This can be used to generate summaries on any page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that should show the summary
    const summaryContainer = document.getElementById('legislation-summary');
    if (!summaryContainer) return;
    
    // Load the legislation data
    fetch('../data/legislation.json')
        .then(response => response.json())
        .then(legislationData => {
            // Create a new summary instance
            const summary = new LegislationSummary(legislationData);
            
            // Generate and display the full summary
            const fullSummary = summary.generateFullSummary();
            
            // Convert markdown to HTML using marked.js
            if (typeof marked !== 'undefined') {
                summaryContainer.innerHTML = marked.parse(fullSummary);
            } else {
                // Fallback if marked.js is not available
                summaryContainer.innerHTML = `<pre>${fullSummary}</pre>`;
                console.warn('marked.js is not loaded. Install it for better formatting.');
            }
            
            // Add a quick summary to the page title or meta description
            const quickSummary = summary.generateQuickSummary();
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = quickSummary.replace(/\*\*/g, '').replace(/\n/g, ' ');
            }
            
            // Add event listeners to glossary terms
            if (window.addGlossaryLinks) {
                window.addGlossaryLinks();
            }
        })
        .catch(error => {
            console.error('Error loading legislation data:', error);
            summaryContainer.innerHTML = '<p>Error loading legislation summary. Please try again later.</p>';
        });
});

// Example of how to use the summary in other scripts:
/*
async function loadLegislationSummary() {
    try {
        const response = await fetch('../data/legislation.json');
        const data = await response.json();
        const summary = new LegislationSummary(data);
        
        // Get a full markdown summary
        const fullSummary = summary.generateFullSummary();
        
        // Or get a quick one-liner
        const quickSummary = summary.generateQuickSummary();
        
        console.log('Full Summary:', fullSummary);
        console.log('Quick Summary:', quickSummary);
        
        return summary;
    } catch (error) {
        console.error('Failed to load legislation summary:', error);
        throw error;
    }
}
*/
