/**
 * Adds cross-references to glossary terms throughout the site
 */
// Store fetched glossary data to avoid refetching
let glossaryDataPromise = null;

async function getGlossaryData() {
    if (!glossaryDataPromise) {
        console.log('GLOSSARY-LINKS.JS: Fetching glossary data for the first time.');
        glossaryDataPromise = fetch('../data/glossary.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load glossary data. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('GLOSSARY-LINKS.JS: Error fetching or parsing glossary data:', error);
                glossaryDataPromise = null; // Reset promise on error so it can be retried
                throw error; // Re-throw to be caught by callers
            });
    }
    return glossaryDataPromise;
}

window.applyGlossaryTooltips = async function(containerElement) {
    if (!containerElement) {
        console.warn('GLOSSARY-LINKS.JS: applyGlossaryTooltips called with no containerElement.');
        return;
    }
    console.log('GLOSSARY-LINKS.JS: Applying glossary tooltips to container:', containerElement);

    try {
        const glossary = await getGlossaryData();
        if (!glossary || !glossary.keyTerms) {
            console.error('GLOSSARY-LINKS.JS: Glossary data is invalid or keyTerms missing.');
            return;
        }

        const glossaryMap = new Map();
        glossary.keyTerms.forEach(term => {
            glossaryMap.set(term.term.toLowerCase(), {
                term: term.term,
                definition: term.definition,
                type: 'term'
            });
        });
        if (glossary.acronyms) {
            glossary.acronyms.forEach(acronym => {
                glossaryMap.set(acronym.acronym.toLowerCase(), {
                    term: acronym.acronym,
                    definition: acronym.expansion,
                    type: 'acronym'
                });
            });
        }

        containerElement.querySelectorAll('.glossary-term').forEach(element => {
            // Prevent re-processing if already has a tooltip
            if (element.querySelector('.glossary-tooltip')) {
                return;
            }
            const term = element.textContent.trim();
            const termData = glossaryMap.get(term.toLowerCase());
            
            if (termData) {
                const tooltip = document.createElement('span');
                tooltip.className = 'glossary-tooltip';
                tooltip.textContent = termData.definition;
                
                element.classList.add('has-tooltip');
                element.appendChild(tooltip);
                
                element.addEventListener('click', function(e) {
                    e.preventDefault(); // Prevent navigation if it's a link
                    e.stopPropagation(); // Prevent event from bubbling to document click listener immediately
                    tooltip.classList.toggle('visible');
                });
            }
        });
        console.log('GLOSSARY-LINKS.JS: Tooltips applied to .glossary-term elements in', containerElement);

    } catch (error) {
        console.error('GLOSSARY-LINKS.JS: Error in applyGlossaryTooltips:', error);
    }
};

// Close tooltip when clicking outside - this should be a single document-level listener
document.addEventListener('click', function(e) {
    document.querySelectorAll('.glossary-term .glossary-tooltip.visible').forEach(tooltip => {
        // Check if the click was outside the tooltip and its parent .glossary-term
        const termElement = tooltip.closest('.glossary-term');
        if (termElement && !termElement.contains(e.target)) {
            tooltip.classList.remove('visible');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('GLOSSARY-LINKS.JS: DOMContentLoaded event fired.');
    // Apply to statically loaded content
    window.applyGlossaryTooltips(document.body);

    // Handle specific legislation page linking (which modifies innerHTML)
    // This needs to run after initial tooltips if legislation content is static
    // and might contain .glossary-term elements already.
    if (document.getElementById('legislation-content')) {
        console.log('GLOSSARY-LINKS.JS: Legislation content detected, attempting to apply legislation-specific links.');
        getGlossaryData().then(glossary => {
            if (!glossary) return;
            const glossaryMap = new Map(); // Rebuild map, or pass from getGlossaryData if it returned it
            glossary.keyTerms.forEach(term => {
                glossaryMap.set(term.term.toLowerCase(), { term: term.term, definition: term.definition, type: 'term' });
            });
            if (glossary.acronyms) {
                glossary.acronyms.forEach(acronym => {
                    glossaryMap.set(acronym.acronym.toLowerCase(), { term: acronym.acronym, definition: acronym.expansion, type: 'acronym' });
                });
            }
            addLegislationLinks(glossaryMap); // addLegislationLinks is defined below
        }).catch(error => {
            console.error('GLOSSARY-LINKS.JS: Error setting up legislation links:', error);
        });
    }
});

/**
 * Fetches the glossary data from the JSON file
 * This function is kept for direct use by addLegislationLinks if getGlossaryData is not used or for legacy.
 * However, getGlossaryData is preferred due to caching.
 */
async function fetchGlossaryData() { // Original fetchGlossaryData, now less used due to caching getGlossaryData
    try {
        const response = await fetch('../data/glossary.json');
        if (!response.ok) {
            throw new Error('Failed to load glossary data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

/**
 * Adds links to glossary terms in the legislation content
 */
function addLegislationLinks(glossaryMap) {
    const contentElement = document.getElementById('legislation-content');
    if (!contentElement) return;
    
    // Convert the content to HTML if it's not already
    let content = contentElement.innerHTML;
    
    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = Array.from(glossaryMap.keys()).sort((a, b) => b.length - a.length);
    
    // Create a regex pattern to match whole words only
    const wordBoundary = '\\b';
    
    // Replace each term with a linked version
    sortedTerms.forEach(term => {
        const termData = glossaryMap.get(term);
        if (!termData || term.length < 5) return; // Skip short terms to avoid too many matches
        
        const pattern = new RegExp(`${wordBoundary}(${escapeRegExp(termData.term)})${wordBoundary}`, 'gi');
        
        // Only replace if the term isn't already inside a link or another tooltip
        content = content.replace(pattern, (match, p1) => {
            // Skip if already wrapped in a link or tooltip
            if (content.includes(`>${p1}<`)) {
                return match;
            }
            
            return `<span class="glossary-term" data-term="${termData.term}">${p1}</span>`;
        });
    });
    
    // Update the content
    contentElement.innerHTML = content;
}

/**
 * Escapes special characters for use in a regular expression
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add some basic styles for the tooltips
const style = document.createElement('style');
style.textContent = `
    .glossary-term {
        position: relative;
        color: #0056b3;
        cursor: help;
        border-bottom: 1px dotted #0056b3;
        text-decoration: none;
    }
    
    .glossary-term:hover {
        text-decoration: none;
    }
    
    .glossary-tooltip {
        visibility: hidden;
        width: 300px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 10px;
        position: absolute;
        z-index: 1000;
        bottom: 125%;
        left: 50%;
        margin-left: -150px;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 0.9em;
        text-align: left;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .glossary-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #333 transparent transparent transparent;
    }
    
    .glossary-tooltip.visible {
        visibility: visible;
        opacity: 1;
    }
    
    @media (max-width: 600px) {
        .glossary-tooltip {
            width: 250px;
            margin-left: -125px;
        }
    }
`;

document.head.appendChild(style);
