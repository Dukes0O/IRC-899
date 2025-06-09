console.log('HOME.JS: File loaded and parsing.');
const HomePage = (() => {
    const init = () => {
        console.log('HomePage.init() called. Attempting to fetch home_content.json...');
        const contentDiv = document.getElementById('home-content');
        if (!contentDiv) {
            console.error('Home page content area (home-content) not found.');
            return;
        }

        // Ensure loading indicator is visible if contentDiv is empty or has only the indicator
        if (!contentDiv.innerHTML.trim() || contentDiv.querySelector('#loading-indicator')) {
             contentDiv.innerHTML = `
                <div id="loading-indicator" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading content...</p>
                </div>`;
        }

        fetch('/data/home_content.json') // Using root-relative path
            .then(response => {
                console.log('Fetch response received for home_content.json:', response);
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status} ${response.statusText}`);
                }
                return response.json().then(jsonData => {
                    console.log('Successfully parsed home_content.json:', jsonData);
                    return jsonData;
                });
            })
            .then(data => {
                renderHomePage(data, contentDiv);
            })
            .catch(error => {
                console.error('Error loading or processing home content:', error);
                if (contentDiv) {
                    contentDiv.innerHTML = `
                        <div class="alert alert-danger">
                            <h3>Error Loading Content</h3>
                            <p>We're having trouble loading the content. Please try refreshing the page or check back later.</p>
                            <p>Error details: ${error.message}</p>
                        </div>`;
                }
            });
    };

    const renderHomePage = (data, contentDiv) => {
        console.log('renderHomePage function called with data:', data);
        
        let html = `
            <section class="hero-section card">
                <h1>${data.hero?.title || 'Welcome'}</h1>
                <p class="lead">${data.hero?.lead || ''}</p>
                <p>${data.hero?.description || ''}</p>
                <div class="quick-nav-hero">
                    ${(data.hero?.cta || []).map(btn => 
                        `<a href="${btn.url}" class="btn ${btn.class || 'btn-primary'}">${btn.text}</a>`
                    ).join('\n')}
                </div>
            </section>

            <section class="key-points">
                <h2>Key Aspects of Section 899</h2>
                <div class="card-deck">
                    ${(data.keyPoints || []).map(point => `
                        <div class="card">
                            <h3>${point.title || 'Key Point'}</h3>
                            <p>${point.content || ''}</p>
                        </div>
                    `).join('\n')}
                </div>
            </section>

            ${(data.sections || []).map(section => `
                <section id="${section.id || ''}" class="content-section card">
                    <h2>${section.title || 'Section'}</h2>
                    ${section.content ? `<p>${section.content}</p>` : ''}
                    ${section.items ? `
                        ${(section.items.length > 0 && typeof section.items[0] === 'object' && section.items[0] !== null) ? `
                            <dl class="definition-list">
                                ${section.items.map(item => `
                                    <dt>${item.term || 'N/A'}</dt>
                                    <dd>${item.definition || 'N/A'}</dd>
                                `).join('\n')}
                            </dl>
                        ` : (section.items.length > 0) ? `
                            <ul>
                                ${section.items.map(item => `<li>${item}</li>`).join('\n')}
                            </ul>
                        ` : ''}
                    ` : ''}
                </section>
            `).join('\n')}

            <section class="quick-links-section card">
                <h2>Discover More</h2>
                <ul>
                    ${(data.quickLinks || []).map(link => `
                        <li><a href="${link.url}">${link.title || 'Link'}</a></li>
                    `).join('\n')}
                </ul>
            </section>

            <p class="disclaimer"><strong>Disclaimer:</strong> ${data.disclaimer || ''}</p>`;

        console.log('Constructed HTML for home page. Attempting to set innerHTML.');
        contentDiv.innerHTML = html;
        console.log('innerHTML set for home-content.');

        initializePageSpecificElements();
    };

    const initializePageSpecificElements = () => {
        console.log('Home page specific elements initialized (if any).');
        // Placeholder for any future JS interactions needed on the home page after content load
    };

    return {
        init
    };
})();
