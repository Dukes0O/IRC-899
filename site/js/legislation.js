console.log('LEGISLATION.JS: File loaded and parsing.');

const LegislationPage = (() => {
    let jsonUrlForError = ''; // To store the last attempted URL for error messages

    const init = () => {
        console.log('LEGISLATION.JS: LegislationPage.init() called.');
        const contentDiv = document.getElementById('legislation-content');
        if (!contentDiv) {
            console.error('LEGISLATION.JS: legislation-content div not found.');
            return;
        }
        contentDiv.innerHTML = '<p>Loading legislation content...</p>';

        const possiblePaths = [
            '/data/legislation.json', // Start with root-relative as it's often most reliable
            '../data/legislation.json',
            'data/legislation.json' // Relative from current page (less reliable with SPA routing)
        ];

        tryFetch(possiblePaths)
            .then(data => {
                renderLegislation(data, contentDiv);
                if (typeof addGlossaryLinks === 'function') {
                    console.log('LEGISLATION.JS: Calling addGlossaryLinks().');
                    addGlossaryLinks(); // Call after content is rendered
                } else {
                    console.warn('LEGISLATION.JS: addGlossaryLinks function not found. Ensure glossary-links.js is loaded and defines it globally.');
                }
            })
            .catch(error => {
                console.error('LEGISLATION.JS: Error loading legislation:', error);
                const errorMsg = `
                    <div class="error-message">
                        <h3>Error Loading Legislation</h3>
                        <p><strong>Error details:</strong> ${error.message}</p>
                        <p><strong>Tried URL(s):</strong> ${jsonUrlForError || 'Multiple paths attempted, see console for details.'}</p>
                        <p>Possible issues:</p>
                        <ol>
                            <li>Check if you're running a local server.</li>
                            <li>Verify the server is running and accessible.</li>
                            <li>Check the browser's console (F12 > Console) for detailed error messages.</li>
                        </ol>
                    </div>`;
                contentDiv.innerHTML = errorMsg;
            });
    };

    const tryFetch = (paths, index = 0) => {
        if (index >= paths.length) {
            return Promise.reject(new Error('All paths failed to load the legislation file'));
        }
        
        const path = paths[index];
        jsonUrlForError = path; // Store for potential error message
        console.log(`LEGISLATION.JS: Trying path: ${path}`);
        
        return fetch(path)
            .then(response => {
                console.log(`LEGISLATION.JS: Response for ${path}:`, response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for path ${path}`);
                }
                return response.json().then(data => {
                    console.log('LEGISLATION.JS: Successfully parsed JSON from path:', path);
                    // Log the keys of the fetched data to check for 'content' property
                    console.log('LEGISLATION.JS: Keys of fetched data:', Object.keys(data)); 
                    return data;
                });
            })
            .catch(error => {
                console.error(`LEGISLATION.JS: Failed to load from ${path}:`, error);
                if (index < paths.length - 1) {
                    return tryFetch(paths, index + 1);
                }
                throw error; // Re-throw if all paths fail
            });
    };

    let renderItemCount = 0; // Counter for debugging
    const renderLegislativeItem = (item, level) => {
        renderItemCount++;
        // console.log(`LEGISLATION.JS: renderLegislativeItem called ${renderItemCount} times. Current item ID: ${item.id}, level: ${level}`);
        if (renderItemCount > 1000) { // Safety break for excessive recursion/items
            console.warn('LEGISLATION.JS: renderLegislativeItem processed over 1000 items, potentially too many. Stopping further rendering for this item branch.');
            return '<p style="color: red;">[Render limit reached for this branch]</p>';
        }

        let itemHtml = '';
        // Ensure heading level is between h3 and h6 for hierarchical display
        const headingLevel = Math.min(Math.max(level + 2, 3), 6);

        itemHtml += `<div class=\"legislative-item level-${level}\">`;

        let titlePrefix = '';
        if (item.id) {
            titlePrefix += `${item.id} `;
        }

        if (item.title) { // Only add heading if there's a title
            itemHtml += `<h${headingLevel} class=\"item-title\">${titlePrefix}${item.title}</h${headingLevel}>`;
        } else if (item.id && !item.text) {
            // If there's an ID but no title and no text, still show the ID as a minimal header
            itemHtml += `<h${headingLevel} class=\"item-title\">${titlePrefix}</h${headingLevel}>`;
        }

        if (item.text) {
            const paragraphs = item.text.split('\n').filter(p => p.trim() !== '');
            paragraphs.forEach(pText => {
                itemHtml += `<p class=\"item-text\">${pText}</p>`;
            });
        }

        // Recursively render children arrays if they exist
        const childKeyOrder = ['paragraphs', 'subparagraphs', 'clauses', 'subclauses'];
        childKeyOrder.forEach(childKey => {
            if (item[childKey] && Array.isArray(item[childKey])) {
                item[childKey].forEach(childItem => {
                    itemHtml += renderLegislativeItem(childItem, level + 1);
                });
            }
        });

        if (item.applicable_rates && Array.isArray(item.applicable_rates)) {
            itemHtml += '<table class=\"rate-schedule\"><thead><tr><th>Year</th><th>Percentage Increase</th><th>Effective Date</th></tr></thead><tbody>';
            item.applicable_rates.forEach(rate => {
                itemHtml += `<tr>\n                    <td>${rate.year || ''}</td>\n                    <td>${(rate.percentage_increase !== undefined && rate.percentage_increase !== null) ? rate.percentage_increase + '%' : ''}</td>\n                    <td>${rate.applicable_date || ''}</td>\n                </tr>`;
            });
            itemHtml += '</tbody></table>';
        }

        itemHtml += `</div>`; // close legislative-item
        return itemHtml;
    };

    const renderLegislation = (data, container) => {
        console.log('LEGISLATION.JS: renderLegislation called with new structure.');
        if (data && data.provisions) {
            console.log(`LEGISLATION.JS: data.provisions contains ${data.provisions.length} top-level items.`);
        } else {
            console.error('LEGISLATION.JS: data.provisions is undefined or null in renderLegislation.');
            container.innerHTML = '<p class="error-message">Error: Legislation provisions data is missing.</p>';
            return;
        }
        renderItemCount = 0; // Reset counter for each full render

        let html = '';

        if (data.section_number && data.section_title) {
            html += `<h2 class=\"legislation-main-title\">${data.section_number} ${data.section_title}</h2>`;
        }

        if (data.provisions && Array.isArray(data.provisions)) {
            let topLevelItemsProcessed = 0;
            data.provisions.forEach((item, index) => {
                // console.log(`LEGISLATION.JS: Processing top-level item ${index + 1}/${data.content.length}, ID: ${item.id}`);
                html += renderLegislativeItem(item, 1); // Start top-level items (e.g., subsections (a), (b)) at level 1
                topLevelItemsProcessed++;
            });
            console.log(`LEGISLATION.JS: Finished processing ${topLevelItemsProcessed} top-level items.`);
        }
        console.log(`LEGISLATION.JS: Total renderLegislativeItem calls: ${renderItemCount}`);

        if (data.clerical_amendment) {
            html += '<div class=\"clerical-amendment-section\">';
            if (data.clerical_amendment.title) {
                html += `<h3>${data.clerical_amendment.title}</h3>`;
            }
            if (data.clerical_amendment.text) {
                const paragraphs = data.clerical_amendment.text.split('\n').filter(p => p.trim() !== '');
                paragraphs.forEach(pText => {
                    html += `<p>${pText}</p>`;
                });
            }
            html += '</div>';
        }

        container.innerHTML = html;
        console.log('LEGISLATION.JS: Legislation content rendered with new structure.');
    };

    return {
        init
    };
})();
