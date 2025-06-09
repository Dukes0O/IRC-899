console.log('NAVIGATION.JS: File loaded and parsing.');
// Navigation module for handling client-side routing and content loading

const Navigation = (() => {
    const contentArea = document.getElementById('content-area');
    const mainNav = document.getElementById('main-nav');

    const routes = {
        '#home': { path: 'pages/home.html', title: 'Home' },
        '#legislation': { path: 'pages/legislation.html', title: 'Legislation' },
        '#key-provisions': { path: 'pages/key_provisions.html', title: 'Key Provisions' },
        '#impact-estimator': { path: 'pages/impact_estimator.html', title: 'Impact Estimator' },
        '#glossary': { path: 'pages/glossary.html', title: 'Glossary' },
        '#faq': { path: 'pages/faq.html', title: 'FAQ' },
        '#about': { path: 'pages/about.html', title: 'About' }
    };

    const defaultRoute = '#home';

    function renderNav() {
        if (!mainNav) {
            console.error('Main navigation element not found.');
            return;
        }
        let navHtml = '<ul>';
        for (const route in routes) {
            navHtml += `<li><a href="${route}">${routes[route].title}</a></li>`;
        }
        navHtml += '</ul>';
        mainNav.innerHTML = navHtml;
        updateActiveLink();
    }

    async function loadContent(hash) {
        if (!contentArea) {
            console.error('Content area element not found.');
            return;
        }

        const route = routes[hash] || routes[defaultRoute];
        const effectiveHash = routes[hash] ? hash : defaultRoute;

        try {
            // Ensure utils.js is loaded and fetchJSONData is available
            if (typeof Utils === 'undefined' || typeof Utils.fetchHTML !== 'function') {
                console.error('Utils.fetchHTML is not available. Make sure utils.js is loaded correctly.');
                contentArea.innerHTML = '<p>Error: Could not load content utilities.</p>';
                return;
            }
            const html = await Utils.fetchHTML(route.path);
            contentArea.innerHTML = html;
            document.title = `Section 899 - ${route.title}`;
            if (window.location.hash !== effectiveHash) {
                 // Update hash without triggering hashchange again if it was a default redirect
                history.pushState(null, '', effectiveHash);
            }
            updateActiveLink();
            executePageSpecificScripts(effectiveHash);
        } catch (error) {
            console.error('Error loading page content:', error);
            contentArea.innerHTML = `<p>Error loading content for ${route.title}. Please try again later.</p>`;
        }
    }

    function updateActiveLink() {
        if (!mainNav) return;
        const links = mainNav.querySelectorAll('a');
        const currentHash = window.location.hash || defaultRoute;
        links.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function handleHashChange() {
        loadContent(window.location.hash || defaultRoute);
    }
    
    function executePageSpecificScripts(hash) {
        if (typeof window.pageInitializers === 'undefined') {
            console.warn('NAVIGATION.JS: pageInitializers not found on window object. Ensure dependent scripts like glossary.js and faq.js are loaded.');
            window.pageInitializers = {};
        }

        console.log(`NAVIGATION.JS: executePageSpecificScripts START. Received hash: "${hash}" (length: ${hash ? hash.length : 'undefined'})`);

        if (hash === '#home') {
            console.log('NAVIGATION.JS: Matched #home.');
            if (typeof HomePage !== 'undefined' && HomePage.init) {
                console.log('NAVIGATION.JS: Calling HomePage.init() for #home');
                HomePage.init();
            } else {
                console.error('NAVIGATION.JS: HomePage or HomePage.init is not defined for #home.');
            }
        } else if (hash === '#legislation') {
            console.log('NAVIGATION.JS: Matched #legislation.');
            if (typeof LegislationPage !== 'undefined' && LegislationPage.init) {
                console.log('NAVIGATION.JS: Calling LegislationPage.init() for #legislation');
                LegislationPage.init();
            } else {
                console.error('NAVIGATION.JS: LegislationPage or LegislationPage.init is not defined for #legislation.');
            }
        } else if (hash === '#key-provisions') { // Corrected from underscore to hyphen
            console.log('NAVIGATION.JS: Matched #key-provisions. Evaluating KeyProvisionsPage...');
            console.log('NAVIGATION.JS: typeof KeyProvisionsPage is:', typeof KeyProvisionsPage);
            if (typeof KeyProvisionsPage !== 'undefined') {
                console.log('NAVIGATION.JS: typeof KeyProvisionsPage.init is:', typeof KeyProvisionsPage.init);
                if (typeof KeyProvisionsPage.init === 'function') {
                    console.log('NAVIGATION.JS: Conditions met. Calling KeyProvisionsPage.init() now.');
                    KeyProvisionsPage.init();
                } else {
                    console.error('NAVIGATION.JS: KeyProvisionsPage.init is NOT a function!');
                }
            } else {
                console.error('NAVIGATION.JS: KeyProvisionsPage IS undefined at the time of call for #key-provisions!');
            }
        } else if (hash === '#impact-estimator') {
            console.log('NAVIGATION.JS: Matched #impact-estimator.');
            if (typeof Calculator !== 'undefined' && Calculator.init) {
                console.log('NAVIGATION.JS: Calling Calculator.init() for #impact-estimator');
                Calculator.init();
            } else {
                console.warn('NAVIGATION.JS: Calculator module or init function not found for #impact-estimator.');
            }
        } else if (hash === '#glossary') {
            console.log('NAVIGATION.JS: Matched #glossary.');
            if (typeof window.pageInitializers.glossary === 'function') {
                console.log('NAVIGATION.JS: Calling glossary initializer for #glossary');
                window.pageInitializers.glossary();
            } else {
                console.warn('NAVIGATION.JS: Glossary initializer (initGlossary) not found.');
            }
        } else if (hash === '#faq') {
            console.log('NAVIGATION.JS: Matched #faq.');
            if (typeof window.pageInitializers.faq === 'function') {
                console.log('NAVIGATION.JS: Calling FAQ initializer for #faq');
                window.pageInitializers.faq();
            } else {
                console.warn('NAVIGATION.JS: FAQ initializer (initFaq) not found.');
            }
        } else {
            console.warn(`NAVIGATION.JS: No specific script logic for hash: "${hash}"`);
        }
        console.log(`NAVIGATION.JS: executePageSpecificScripts END for hash: "${hash}"`);
    }

    function init() {
        renderNav();
        window.addEventListener('hashchange', handleHashChange);
        // Load initial content based on current hash or default
        loadContent(window.location.hash || defaultRoute);
    }

    return {
        init,
        loadContent // Expose for potential external use if needed
    };
})();
