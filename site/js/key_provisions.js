// js/key_provisions.js
console.log('KEY_PROVISIONS.JS: File loaded and parsing.');

let KeyProvisionsPage;

(() => { // Anonymous IIFE to define and assign KeyProvisionsPage
    const module = {}; // Temporary object to build the module
    let jsonUrlForError = ''; // To store the last attempted URL for error messages

    // Initializes the Key Provisions page content
    module.init = () => {
        console.log('KEY_PROVISIONS.JS: KeyProvisionsPage.init() called.');
        const contentDiv = document.getElementById('key-provisions-content');
        if (!contentDiv) {
            console.error('KEY_PROVISIONS.JS: key-provisions-content div not found.');
            return;
        }
        console.log('KEY_PROVISIONS.JS: key-provisions-content div found:', contentDiv);
        contentDiv.innerHTML = '<p>Loading key provisions content...</p>';

        const possiblePaths = [
            '/data/key_provisions.json', // Root-relative path
            '../data/key_provisions.json', // Relative path for pages in subdirectories
            'data/key_provisions.json' // Relative path from current page (e.g., if index.html is in root)
        ];

        tryFetch(possiblePaths)
            .then(data => {
                renderKeyProvisions(data, contentDiv);

                // Initialize Charts Recursively
                if (typeof Chart !== 'undefined' && data.sections) {
                    console.log('KEY_PROVISIONS.JS: Starting recursive chart initialization.');
                    data.sections.forEach(section => {
                        if (section.content && Array.isArray(section.content)) {
                            initializeChartsRecursive(section.content);
                        }
                    });
                }

                // Initialize Mermaid if it's loaded and there's Mermaid code
                if (typeof mermaid !== 'undefined' && data.sections && data.sections.some(s => s.content.some(c => c.type === 'tool_item' && c.mermaid_code))) {
                    console.log('KEY_PROVISIONS.JS: Initializing Mermaid charts.');
                    // Ensure Mermaid is initialized correctly before running.
                    // The `startOnLoad: false` is important if we call `mermaid.run()` manually.
                    mermaid.initialize({ startOnLoad: false }); 
                    mermaid.run(); // Process all mermaid blocks on the page
                }
                // Apply glossary links
                if (typeof window.applyGlossaryTooltips === 'function') {
                    console.log('KEY_PROVISIONS.JS: Calling window.applyGlossaryTooltips function for container:', contentDiv);
                    window.applyGlossaryTooltips(contentDiv);
                } else {
                    console.warn('KEY_PROVISIONS.JS: window.applyGlossaryTooltips function not found. Ensure glossary-links.js is loaded and defines this function globally.');
                }
            })
            .catch(error => {
                console.error('KEY_PROVISIONS.JS: Error loading key provisions content:', error);
                const errorMsg = `
                    <div class="error-message">
                        <h3>Error Loading Key Provisions</h3>
                        <p><strong>Error details:</strong> ${error.message}</p>
                        <p><strong>Tried URL(s):</strong> ${jsonUrlForError || 'Multiple paths attempted, see console for details.'}</p>
                        <p>Please check the console for more details and ensure the server is running and the JSON file exists at one of the attempted paths.</p>
                    </div>`;
                contentDiv.innerHTML = errorMsg;
            });
    };

    // Tries to fetch JSON data from a list of possible paths
    const tryFetch = (paths, index = 0) => {
        if (index >= paths.length) {
            return Promise.reject(new Error('All paths failed to load the key_provisions.json file'));
        }
        
        const path = paths[index];
        jsonUrlForError = path; // Store the current path for error reporting
        console.log(`KEY_PROVISIONS.JS: Attempting to fetch key_provisions.json from: ${path}`);
        
        return fetch(path)
            .then(response => {
                console.log(`KEY_PROVISIONS.JS: Response for ${path}:`, response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for path ${path}`);
                }
                return response.json().then(data => {
                    console.log('KEY_PROVISIONS.JS: Successfully parsed JSON from path:', path);
                    console.log('KEY_PROVISIONS.JS: Fetched data keys:', Object.keys(data)); // Log keys of fetched data
                    return data;
                });
            })
            .catch(error => {
                console.error(`KEY_PROVISIONS.JS: Failed to load from ${path}:`, error.message);
                if (index < paths.length - 1) {
                    // Try the next path in the list
                    return tryFetch(paths, index + 1);
                }
                // All paths have failed
                throw error; 
            });
    };

    // Renders the key provisions content into the specified container
    const renderKeyProvisions = (data, container) => {
        console.log('KEY_PROVISIONS.JS: renderKeyProvisions called with data.');
        let html = '';

        if (data.page_title) {
            html += `<h1>${data.page_title}</h1>`;
        }
        if (data.intro_paragraph) {
            html += `<p>${data.intro_paragraph}</p>`;
        }

        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                html += `<section id="${section.id || ''}" class="card">
                           <h2>${section.title}</h2>`;
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach(item => {
                        html += renderContentItem(item);
                    });
                }
                html += '</section>'; // Close section tag
            });
        }

        if (data.disclaimer) {
            html += `<p class="disclaimer">${data.disclaimer}</p>`;
        }

        container.innerHTML = html;
        console.log('KEY_PROVISIONS.JS: Key provisions content rendered.');
    };

    function initializeChartsRecursive(items) {
        if (!items || !Array.isArray(items)) return;

        items.forEach(item => {
            if (item.type === 'chart' && item.chart_id && item.data && item.options) {
                const chartCanvas = document.getElementById(item.chart_id);
                if (chartCanvas) {
                    try {
                        new Chart(chartCanvas, {
                            type: item.chart_type || 'bar',
                            data: item.data,
                            options: item.options
                        });
                        console.log(`KEY_PROVISIONS.JS: Chart '${item.chart_id}' initialized recursively.`);
                    } catch (e) {
                        console.error(`KEY_PROVISIONS.JS: Error initializing chart '${item.chart_id}' recursively:`, e);
                        const chartContainer = chartCanvas.parentElement;
                        if (chartContainer) {
                            chartContainer.innerHTML = `<p class="error-message">Error rendering chart '${item.title || item.chart_id}'. Details in console.</p>`;
                        }
                    }
                } else {
                    console.warn(`KEY_PROVISIONS.JS: Canvas element with ID '${item.chart_id}' not found for recursive chart rendering.`);
                }
            } else if (item.type === 'nested_list' && item.items && Array.isArray(item.items)) {
                item.items.forEach(li_item => {
                    if (li_item.sub_content && Array.isArray(li_item.sub_content)) {
                        initializeChartsRecursive(li_item.sub_content);
                    }
                });
            }
            // Add other container types if charts can be nested in them, e.g., if a 'card' or 'accordion' type could contain charts.
        });
    }

    function renderContentItem(item) {
        let html = '';
        if (!item || !item.type) {
            console.warn('KEY_PROVISIONS.JS: Invalid item for renderContentItem:', item);
            return '<p class="error-message">Invalid content item data.</p>';
        }

        switch (item.type) {
            case 'paragraph':
                html += `<p>${item.text}</p>`;
                break;
            case 'list':
                if (item.items && Array.isArray(item.items)) {
                    html += '<ul>';
                    item.items.forEach(li => {
                        html += `<li>${li}</li>`;
                    });
                    html += '</ul>';
                }
                break;
            case 'definition_item':
                html += `<div class="definition-item">
                           <h4>${item.term}</h4>
                           <p>${item.definition}</p>`;
                if (item.points && Array.isArray(item.points)) {
                    html += '<ul>';
                    item.points.forEach(point => {
                        html += `<li>${point}</li>`;
                    });
                    html += '</ul>';
                }
                html += '</div>';
                break;
            case 'nested_list':
                if (item.items && Array.isArray(item.items)) {
                    html += '<ul>';
                    item.items.forEach(li_item => {
                        html += `<li>${li_item.text || ''}`;
                        if (li_item.sub_items && Array.isArray(li_item.sub_items)) {
                            html += '<ul>';
                            li_item.sub_items.forEach(sub_li => {
                                html += `<li>${sub_li}</li>`;
                            });
                            html += '</ul>';
                        }
                        if (li_item.sub_content && Array.isArray(li_item.sub_content)) {
                            // Render complex sub-content recursively
                            li_item.sub_content.forEach(sub_content_item => {
                                html += renderContentItem(sub_content_item);
                            });
                        }
                        html += '</li>';
                    });
                    html += '</ul>';
                }
                break;
            case 'tool_item': // For Mermaid diagrams or other tools
                if (item.mermaid_code) {
                    html += `<h4>${item.title || 'Diagram'}</h4>`;
                    if (item.description) {
                        html += `<p>${item.description}</p>`;
                    }
                    html += `<div class="mermaid-container"><pre class="mermaid">${item.mermaid_code}</pre></div>`;
                } else {
                    html += `<p class="error-message">Tool item '${item.title}' is missing its content (e.g., mermaid_code).</p>`;
                    console.warn('KEY_PROVISIONS.JS: Tool item missing mermaid_code:', item);
                }
                break;
            case 'table':
                if (item.headers && item.rows) {
                    html += '<div class="table-responsive"><table class="table table-bordered table-striped"><thead><tr>';
                    item.headers.forEach(header => {
                        html += `<th>${header}</th>`;
                    });
                    html += '</tr></thead><tbody>';
                    item.rows.forEach(row => {
                        html += '<tr>';
                        row.forEach(cell => {
                            html += `<td>${cell}</td>`;
                        });
                        html += '</tr>';
                    });
                    html += '</tbody></table></div>';
                } else {
                    html += `<p class="error-message">Table '${item.title || 'Untitled'}' could not be rendered. Missing headers or rows.</p>`;
                    console.warn('KEY_PROVISIONS.JS: Invalid table data - missing headers or rows');
                }
                break;
            case 'chart':
                if (item.chart_id && item.data && item.options && typeof Chart !== 'undefined') {
                    html += `<div>
                               <h4>${item.title || 'Chart'}</h4>
                               <p>${item.description || ''}</p>
                               <div class="chart-container" style="position: relative; height:300px; width:90%; max-width: 600px; margin: 20px auto;">
                             <canvas id="${item.chart_id}"></canvas>
                           </div>
                             </div>`;
                } else {
                    html += `<p class="error-message">Chart '${item.title || item.chart_id}' could not be rendered. Missing data, ID, options, or Chart.js library.</p>`;
                    console.warn('KEY_PROVISIONS.JS: Invalid chart data - missing chart_id, data, options, or Chart.js library not loaded for item:', item);
                }
                break;
            case 'placeholder_item': // Added to handle placeholder items if any
                 html += `<div>${item.text || 'Placeholder'}</div>`;
                 break;
            default:
                console.warn(`KEY_PROVISIONS.JS: Unknown content type: ${item.type}`);
                html += `<p class="error-message">Unknown content type: ${item.type}</p>`;
        }
        return html;
    }

    // Assign the fully built module to the global KeyProvisionsPage variable
    KeyProvisionsPage = module;
    console.log('KEY_PROVISIONS.JS: KeyProvisionsPage object defined. Has init method:', typeof KeyProvisionsPage.init === 'function');

})(); // End of IIFE
