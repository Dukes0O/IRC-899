// Utility functions module

const Utils = (() => {

    /**
     * Fetches JSON data from a given URL.
     * @param {string} url - The URL to fetch JSON data from.
     * @returns {Promise<object>} - A promise that resolves with the JSON data.
     * @throws {Error} - Throws an error if the network response is not ok or if parsing fails.
     */
    async function fetchJSONData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${url}: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Failed to fetch or parse JSON from ${url}:`, error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    /**
     * Fetches HTML content from a given URL.
     * @param {string} url - The URL to fetch HTML content from.
     * @returns {Promise<string>} - A promise that resolves with the HTML content as text.
     * @throws {Error} - Throws an error if the network response is not ok.
     */
    async function fetchHTML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${url}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            return html;
        } catch (error) {
            console.error(`Failed to fetch HTML from ${url}:`, error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    /**
     * Debounce function to limit the rate at which a function can fire.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Expose public functions
    return {
        fetchJSONData,
        fetchHTML,
        debounce
    };

})();
