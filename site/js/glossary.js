// site/js/glossary.js

async function loadGlossaryData() {
    try {
        const response = await fetch('../data/glossary.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching glossary data:', error);
        return null;
    }
}

function populateGlossarySection(containerId, items, itemRenderer) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Glossary container ${containerId} not found.`);
        return;
    }

    container.innerHTML = ''; // Clear loading message or old content

    if (items && items.length > 0) {
        items.forEach(item => {
            const itemDiv = itemRenderer(item);
            if (itemDiv) {
                container.appendChild(itemDiv);
            }
        });
    } else {
        container.innerHTML = '<p>No items found for this section.</p>';
    }
}

function renderKeyTerm(item) {
    const termDiv = document.createElement('div');
    termDiv.className = 'glossary-item card'; // Added card class for styling
    let htmlContent = `<h3>${item.term}</h3><p>${item.definition}</p>`;
    if (item.examples) {
        htmlContent += `<p><em>Examples: ${item.examples}</em></p>`;
    }
    if (item.special_cases) {
        htmlContent += `<p><em>Special Cases: ${item.special_cases}</em></p>`;
    }
    termDiv.innerHTML = htmlContent;
    return termDiv;
}

function renderAcronym(item) {
    const acronymDiv = document.createElement('div');
    acronymDiv.className = 'glossary-item card'; // Added card class for styling
    acronymDiv.innerHTML = `<h3>${item.acronym}</h3><p>${item.expansion}</p>`;
    return acronymDiv;
}

function renderRelatedLegislation(item) {
    const legislationDiv = document.createElement('div');
    legislationDiv.className = 'glossary-item card'; // Added card class for styling
    legislationDiv.innerHTML = `<h3>${item.term}</h3><p>${item.description}</p>`;
    return legislationDiv;
}

async function initGlossary() {
    console.log('Initializing Glossary page...');
    const glossaryData = await loadGlossaryData();

    if (glossaryData) {
        populateGlossarySection('glossary-key-terms-container', glossaryData.keyTerms, renderKeyTerm);
        populateGlossarySection('glossary-acronyms-container', glossaryData.acronyms, renderAcronym);
        populateGlossarySection('glossary-related-legislation-container', glossaryData.relatedLegislation, renderRelatedLegislation);
    } else {
        // Handle cases where data loading failed for all sections
        const idsToClear = ['glossary-key-terms-container', 'glossary-acronyms-container', 'glossary-related-legislation-container'];
        idsToClear.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<p class="error">Error loading glossary content. Please check the console for details or try refreshing.</p>';
            }
        });
    }
    console.log('Glossary page initialization complete.');
}

// Expose initGlossary to be called by navigation.js
// This is a common pattern, but ensure it doesn't conflict with other scripts if window object is used extensively.
if (typeof window.pageInitializers === 'undefined') {
    window.pageInitializers = {};
}
window.pageInitializers.glossary = initGlossary;
