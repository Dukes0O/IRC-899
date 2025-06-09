// site/js/faq.js

async function loadFaqData() {
    try {
        const response = await fetch('../data/faq.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching FAQ data:', error);
        return null;
    }
}

function populateFaqCategory(containerId, questions, categoryName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`FAQ container ${containerId} not found.`);
        return;
    }

    container.innerHTML = ''; // Clear loading message or old content

    const categoryQuestions = questions.filter(q => q.category.toLowerCase() === categoryName.toLowerCase());

    if (categoryQuestions.length > 0) {
        categoryQuestions.forEach(item => {
            const faqItemDiv = document.createElement('div');
            faqItemDiv.className = 'faq-item card'; // Added card class for styling
            faqItemDiv.innerHTML = `<h3>${item.question}</h3><p>${item.answer}</p>`;
            container.appendChild(faqItemDiv);
        });
    } else {
        container.innerHTML = `<p>No questions found for the ${categoryName} category.</p>`;
    }
}

async function initFaq() {
    console.log('Initializing FAQ page...');
    const faqData = await loadFaqData();

    if (faqData && faqData.faqs) {
        populateFaqCategory('faq-general-container', faqData.faqs, 'general');
        populateFaqCategory('faq-technical-container', faqData.faqs, 'technical');
        populateFaqCategory('faq-compliance-container', faqData.faqs, 'compliance');
    } else {
        // Handle cases where data loading failed for all sections
        const idsToClear = ['faq-general-container', 'faq-technical-container', 'faq-compliance-container'];
        idsToClear.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<p class="error">Error loading FAQ content. Please check the console for details or try refreshing.</p>';
            }
        });
    }
    console.log('FAQ page initialization complete.');
}

// Expose initFaq to be called by navigation.js
if (typeof window.pageInitializers === 'undefined') {
    window.pageInitializers = {};
}
window.pageInitializers.faq = initFaq;
