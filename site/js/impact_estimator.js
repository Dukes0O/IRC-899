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
        const flowchartContainer = document.getElementById('impact-estimator-flowchart-content');
        
        if (!flowchartContainer) {
            console.error('IMPACT_ESTIMATOR.JS: Target container #impact-estimator-flowchart-content not found.');
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
                    flowchartContainer.innerHTML = '<p class="error-message">Failed to load impact estimator flowchart data.</p>';
                    console.error('IMPACT_ESTIMATOR.JS: Flowchart data is null or undefined after fetch.');
                    return;
                }

                // Revised flowchart rendering logic
                if (data.sections && Array.isArray(data.sections) && data.sections.length > 0 &&
                    data.sections[0].content && Array.isArray(data.sections[0].content) && data.sections[0].content.length > 0) {
                    
                    const flowchartItem = data.sections[0].content[0]; // Assuming the first item in the first section's content is the flowchart
                    if (flowchartItem && flowchartItem.type === 'tool_item') {
                        flowchartContainer.innerHTML = renderContentItem(flowchartItem);
                        console.log('IMPACT_ESTIMATOR.JS: Flowchart item rendered into #impact-estimator-flowchart-content.');
                    } else {
                        flowchartContainer.innerHTML = '<p class="error-message">Flowchart item is not a valid tool_item in JSON.</p>';
                        console.error('IMPACT_ESTIMATOR.JS: Expected flowchart tool_item not found or invalid.');
                    }
                } else {
                    flowchartContainer.innerHTML = '<p class="error-message">Flowchart data (sections or content) is missing or malformed in JSON.</p>';
                    console.error('IMPACT_ESTIMATOR.JS: Flowchart data.sections structure is not as expected.');
                }

                if (typeof mermaid !== 'undefined') {
                    try {
                        // mermaid.initialize is typically called once globally (e.g. in index.html)
                        // We just need to run it on the new content.
                        mermaid.run({ nodes: flowchartContainer.querySelectorAll('.mermaid') });
                        console.log('IMPACT_ESTIMATOR.JS: Mermaid diagrams processed for flowchart.');
                    } catch (e) {
                        console.error('IMPACT_ESTIMATOR.JS: Error running Mermaid for flowchart:', e);
                    }
                } else {
                    console.warn('IMPACT_ESTIMATOR.JS: Mermaid library not found. Flowchart will not be rendered.');
                }
                // Guard example and jump link rendering
                if (data.examples_content && Array.isArray(data.examples_content)) {
                    generateExampleJumpLinks(data.examples_content);
                    renderExamples(data.examples_content); // Render examples
                } else {
                    console.warn('IMPACT_ESTIMATOR.JS: examples_content is missing or not an array. Skipping example/jump link rendering.');
                    const jumpLinksContainer = document.getElementById('example-jump-links');
                    if (jumpLinksContainer) jumpLinksContainer.innerHTML = '<p>No examples available to link to.</p>';
                    const examplesContainer = document.getElementById('estimator-examples-content');
                    if (examplesContainer) examplesContainer.innerHTML = '<p>No examples available.</p>';
                }

                if (typeof window.applyGlossaryTooltips === 'function') {
                    window.applyGlossaryTooltips(flowchartContainer);
                    console.log('IMPACT_ESTIMATOR.JS: Glossary tooltips applied to flowchart container.');
                }
            })
            .catch(error => {
                console.error('IMPACT_ESTIMATOR.JS: Main error loading flowchart page content -', error);
                flowchartContainer.innerHTML = `<p class="error-message">Error loading Impact Estimator flowchart. Please check the console for details.</p>`;
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

    function generateExampleJumpLinks(examplesData) {
        const jumpLinksContainer = document.getElementById('example-jump-links');
        if (!jumpLinksContainer) {
            console.warn('IMPACT_ESTIMATOR.JS: Jump links container #example-jump-links not found.');
            return;
        }
        if (!examplesData || !Array.isArray(examplesData) || examplesData.length === 0) {
            jumpLinksContainer.innerHTML = '<p>No examples available to link to.</p>';
            return;
        }

        jumpLinksContainer.innerHTML = ''; // Clear previous links if any
        const ul = document.createElement('ul');
        examplesData.forEach((example, index) => {
            const exampleId = `example-${index}`; // 0-indexed
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${exampleId}`;
            a.textContent = example.title || 'Unnamed Example';
            a.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default anchor behavior
                const targetId = this.getAttribute('href').substring(1); // Get ID from href (remove #)
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                    console.warn(`IMPACT_ESTIMATOR.JS: Target element with ID '${targetId}' not found for jump link.`);
                }
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        jumpLinksContainer.appendChild(ul);
        console.log('IMPACT_ESTIMATOR.JS: Example jump links generated with click handlers.');
    }

    function renderExamples(examplesData) {
        const examplesContainer = document.getElementById('estimator-examples-content');
        if (!examplesContainer) {
            console.error('IMPACT_ESTIMATOR.JS: Examples container #estimator-examples-content not found.');
            return;
        }
        if (!examplesData || !Array.isArray(examplesData)) {
            examplesContainer.innerHTML = '<p>No examples available at this time.</p>';
            console.warn('IMPACT_ESTIMATOR.JS: examples_content is missing or not an array in JSON data.');
            return;
        }

        let fullExamplesHtml = '';
        examplesData.forEach((example, index) => {
            const exampleId = `example-${index}`; // 0-indexed
            fullExamplesHtml += `<div class="example-item" id="${exampleId}">`;
            if (example.title) {
                fullExamplesHtml += `<h3>${example.title}</h3>`;
            }
            if (example.text) {
                const contentBlocks = example.text.split('\n\n');
                contentBlocks.forEach(block => {
                    const trimmedBlock = block.trim();
                    if ((trimmedBlock.startsWith('<ul') && trimmedBlock.endsWith('</ul>')) || 
                        (trimmedBlock.startsWith('<table') && trimmedBlock.endsWith('</table>'))) {
                        fullExamplesHtml += trimmedBlock;
                    } else {
                        const paragraphs = trimmedBlock.split('\n').map(p => `<p>${p.trim()}</p>`).join('');
                        fullExamplesHtml += paragraphs;
                    }
                });
            }
            fullExamplesHtml += '</div>';
        });

        examplesContainer.innerHTML = fullExamplesHtml;
        console.log('IMPACT_ESTIMATOR.JS: Examples rendered into #estimator-examples-content with new block logic.');
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
