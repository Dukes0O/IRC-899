document.addEventListener('DOMContentLoaded', () => {
    const module = {};

    const tryFetch = (paths) => {
        return new Promise(async (resolve, reject) => {
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`IMPACT_ESTIMATOR.JS: Successfully fetched data from ${path}`);
                        resolve(data);
                        return;
                    }
                } catch (error) {
                    console.warn(`IMPACT_ESTIMATOR.JS: Failed to fetch or parse data from ${path}:`, error);
                }
            }
            reject(new Error('IMPACT_ESTIMATOR.JS: Failed to fetch data from all provided paths.'));
        });
    };

    function renderImpactEstimator(data, container) {
        if (!data || !container) {
            console.error('IMPACT_ESTIMATOR.JS: Missing data or container for rendering.');
            if (container) container.innerHTML = '<p class="error-message">Failed to load impact estimator content. Data or container missing.</p>';
            return;
        }

        let html = '';
        if (data.page_title) {
            const titleElement = document.getElementById('impact-estimator-title');
            if (titleElement) titleElement.textContent = data.page_title;
            else html += `<h1>${data.page_title}</h1>`;
        }
        if (data.intro_paragraph) {
            const introElement = document.getElementById('impact-estimator-intro');
            if (introElement) introElement.textContent = data.intro_paragraph;
            else html += `<p>${data.intro_paragraph}</p>`;
        }

        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                if (section.title) {
                    html += `<h2>${section.title}</h2>`;
                }
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach(item => {
                        html += renderContentItem(item);
                    });
                }
            });
        }
        container.innerHTML += html; 
        console.log('IMPACT_ESTIMATOR.JS: Impact estimator content rendered.');
    }

    function renderContentItem(item) {
        let itemHtml = '';
        if (!item || !item.type) {
            console.warn('IMPACT_ESTIMATOR.JS: Skipping invalid content item:', item);
            return '<p class="error-message">Invalid content item encountered.</p>';
        }

        switch (item.type) {
            case 'paragraph':
                itemHtml = `<p>${item.text}</p>`;
                break;
            case 'tool_item': // For Mermaid diagrams
                if (item.mermaid_code && item.title) {
                    itemHtml = `<div>
                                  <h3>${item.title}</h3>
                                  ${item.description ? `<p>${item.description}</p>` : ''}
                                  <div class="mermaid" style="margin: 20px auto; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: center;">
                                    ${item.mermaid_code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                  </div>
                                </div>`;
                } else {
                    itemHtml = `<p class="error-message">Mermaid diagram '${item.title || 'Untitled'}' could not be rendered. Missing code or title.</p>`;
                    console.warn('IMPACT_ESTIMATOR.JS: Missing mermaid_code or title for tool_item:', item);
                }
                break;
            default:
                itemHtml = `<p class="error-message">Unsupported content type: ${item.type}</p>`;
                console.warn(`IMPACT_ESTIMATOR.JS: Unsupported content type '${item.type}':`, item);
        }
        return itemHtml;
    }

    module.init = () => {
        console.log('IMPACT_ESTIMATOR.JS: Initializing Impact Estimator page specific script (for flowchart).');
        const mainContentArea = document.getElementById('content-area'); // Target the main content area populated by navigation.js
        
        if (!mainContentArea) {
            console.error('IMPACT_ESTIMATOR.JS: Main content area #content-area not found.');
            return;
        }

        const possiblePaths = [
            '../data/impact_estimator.json',
            './data/impact_estimator.json',
            'data/impact_estimator.json'
        ];

        tryFetch(possiblePaths)
            .then(data => {
                if (!data) {
                    mainContentArea.innerHTML = '<p class="error-message">Failed to load impact estimator flowchart data.</p>';
                    console.error('IMPACT_ESTIMATOR.JS: Flowchart data is null or undefined after fetch.');
                    return;
                }

                let generatedHtml = '';
                if (data.page_title) {
                    generatedHtml += `<h1>${data.page_title}</h1>`;
                }
                if (data.intro_paragraph) {
                    generatedHtml += `<p>${data.intro_paragraph}</p>`;
                }

                if (data.sections && Array.isArray(data.sections)) {
                    data.sections.forEach(section => {
                        if (section.title) {
                            generatedHtml += `<h2>${section.title}</h2>`;
                        }
                        if (section.content && Array.isArray(section.content)) {
                            section.content.forEach(item => {
                                generatedHtml += renderContentItem(item); // Assumes renderContentItem is defined in this scope
                            });
                        }
                    });
                }
                
                mainContentArea.innerHTML = generatedHtml; // Replace content of mainContentArea with flowchart page
                console.log('IMPACT_ESTIMATOR.JS: Flowchart content rendered into #content-area.');

                if (typeof mermaid !== 'undefined') {
                    try {
                        // mermaid.initialize is typically called once globally (e.g. in index.html)
                        // We just need to run it on the new content.
                        mermaid.run({ nodes: mainContentArea.querySelectorAll('.mermaid') });
                        console.log('IMPACT_ESTIMATOR.JS: Mermaid diagrams processed for flowchart.');
                    } catch (e) {
                        console.error('IMPACT_ESTIMATOR.JS: Error running Mermaid for flowchart:', e);
                    }
                } else {
                    console.warn('IMPACT_ESTIMATOR.JS: Mermaid library not found. Flowchart will not be rendered.');
                }

                if (typeof window.applyGlossaryTooltips === 'function') {
                    window.applyGlossaryTooltips(mainContentArea);
                    console.log('IMPACT_ESTIMATOR.JS: Glossary tooltips applied to flowchart page.');
                }
            })
            .catch(error => {
                console.error('IMPACT_ESTIMATOR.JS: Main error loading flowchart page content -', error);
                mainContentArea.innerHTML = `<p class="error-message">Error loading Impact Estimator flowchart. Please check the console for details.</p>`;
            });
    };

    // Ensure renderContentItem is defined within this script's scope if it's not already global
    // For this example, assuming renderContentItem from the previous version of the script is available.
    // If it was inside the old module.init, it needs to be moved out or passed appropriately.
    // The original script had renderImpactEstimator and renderContentItem as separate functions.
    // We are effectively replacing renderImpactEstimator's body here in init.
    // The renderContentItem function needs to be present.
    // Adding it here for completeness from the previous version of the script:
    function renderContentItem(item) {
        let itemHtml = '';
        if (!item || !item.type) {
            console.warn('IMPACT_ESTIMATOR.JS: Skipping invalid content item:', item);
            return '<p class="error-message">Invalid content item encountered.</p>';
        }

        switch (item.type) {
            case 'paragraph':
                itemHtml = `<p>${item.text}</p>`;
                break;
            case 'tool_item': // For Mermaid diagrams
                if (item.mermaid_code && item.title) {
                    itemHtml = `<div>
                                  <h3>${item.title}</h3>
                                  ${item.description ? `<p>${item.description}</p>` : ''}
                                  <div class="mermaid" style="margin: 20px auto; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: center;">
                                    ${item.mermaid_code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                                  </div>
                                </div>`;
                } else {
                    itemHtml = `<p class="error-message">Mermaid diagram '${item.title || 'Untitled'}' could not be rendered. Missing code or title.</p>`;
                    console.warn('IMPACT_ESTIMATOR.JS: Missing mermaid_code or title for tool_item:', item);
                }
                break;
            default:
                itemHtml = `<p class="error-message">Unsupported content type: ${item.type}</p>`;
                console.warn(`IMPACT_ESTIMATOR.JS: Unsupported content type '${item.type}':`, item);
        }
        return itemHtml;
    }

    // Expose module.init to be called by navigation.js
    window.pageScripts = window.pageScripts || {};
    window.pageScripts.impact_estimator = module.init;

    // If this script is loaded directly on impact_estimator.html (e.g. for testing without hash routing)
    // or if navigation.js somehow misses it, try to initialize.
    // However, primary initialization should be via navigation.js executePageSpecificScripts.
    if (document.getElementById('content-impact-estimator')) {
         // module.init(); // Let navigation.js handle the call based on hash
    }
});
