// Impact Estimator (Calculator) module

const Calculator = (() => {
    let form = null;
    let resultsDiv = null;
    let taxData = {}; // To store loaded tax_data.json

    function populateCountrySelect() {
        const countrySelect = document.getElementById('country-import');
        if (!countrySelect || !taxData.countries) {
            console.error('Country select dropdown not found or no country data available.');
            if (resultsDiv) resultsDiv.innerHTML += '<p class="error">Could not populate country list.</p>';
            return;
        }

        // Clear existing options except for the placeholder
        while (countrySelect.options.length > 1) {
            countrySelect.remove(1);
        }

        taxData.countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    }

    async function loadTaxData() {
        try {
            if (typeof Utils === 'undefined' || typeof Utils.fetchJSONData !== 'function') {
                console.error('Utils.fetchJSONData is not available.');
                return false;
            }
            const loadedData = await Utils.fetchJSONData('../data/tax_data.json'); // Corrected path
            if (!loadedData || !loadedData.countries) {
                console.error('Loaded tax data is invalid or missing countries array.');
                throw new Error('Invalid tax data format.');
            }
            taxData = loadedData;
            console.log('Tax data loaded:', taxData);
            populateCountrySelect(); // Populate dropdown after data is loaded
            return true;
        } catch (error) {
            console.error('Failed to load tax data:', error);
            if (resultsDiv) resultsDiv.innerHTML = '<p class="error">Could not load necessary tax data. Calculator non-functional.</p>';
            return false;
        }
    }

    function calculateImpact(event) {
        event.preventDefault();
        if (!form || !resultsDiv) {
            console.error('Calculator form or results area not found.');
            return;
        }

        if (Object.keys(taxData).length === 0 || !taxData.countries) {
            resultsDiv.innerHTML = '<p class="error">Tax data is not loaded or invalid. Cannot perform calculation.</p>';
            return;
        }

        // --- Gather inputs --- 
        const entityType = document.getElementById('entity-type').value;
        const selectedCountryId = document.getElementById('country-import').value;
        const taxableAmountInput = document.getElementById('taxable-amount').value;
        const countryStatus = document.getElementById('country-status').value; // e.g., 'designated', 'non-designated'
        const taxYear = document.getElementById('tax-year').value;

        // --- Input Validation ---
        if (!selectedCountryId) {
            resultsDiv.innerHTML = '<p class="error">Please select a Country of Import.</p>';
            return;
        }
        const taxableAmount = parseFloat(taxableAmountInput);
        if (isNaN(taxableAmount) || taxableAmount <= 0) {
            resultsDiv.innerHTML = '<p class="error">Please enter a valid Taxable Amount greater than zero.</p>';
            return;
        }

        // --- Find Country Data ---
        const selectedCountryData = taxData.countries.find(c => c.id === selectedCountryId);
        if (!selectedCountryData) {
            resultsDiv.innerHTML = '<p class="error">Selected country data not found. Please try again.</p>';
            return;
        }

        // --- Gather additional inputs for ramp-up ---
        const applicableYearInput = document.getElementById('applicable-date').value;
        const applicableYear = parseInt(applicableYearInput);

        // --- Calculate Section 899 Surcharge with Ramp-Up ---
        let section899Surcharge = 0;
        let calculationExplanation = "Section 899 Surcharge does not apply based on selected Country Status.";
        let rampUpFactor = 1.0; // Default to 100%
        let rampUpExplanation = '';

        if (countryStatus === 'listed' || countryStatus === 'hypothetical') {
            const baseSurchargeRate = selectedCountryData.section_899_surcharge_rate;
            
            if (!isNaN(applicableYear)) {
                if (applicableYear === 2024) {
                    rampUpFactor = 0.50; // 50% for 2024
                    rampUpExplanation = ` (Rate adjusted by 50% ramp-up for ${applicableYear})`;
                } else if (applicableYear === 2025) {
                    rampUpFactor = 0.75; // 75% for 2025
                    rampUpExplanation = ` (Rate adjusted by 75% ramp-up for ${applicableYear})`;
                } else if (applicableYear < 2024) {
                    rampUpFactor = 0; // 0% before 2024
                    rampUpExplanation = ` (Rate adjusted by 0% ramp-up for ${applicableYear})`;
                } else { // 2026 and beyond
                    rampUpFactor = 1.0; // Full rate
                    rampUpExplanation = ` (Full rate applied for ${applicableYear})`;
                }
            } else {
                rampUpExplanation = ' (Applicable year for ramp-up not specified or invalid, full rate assumed if applicable)';
            }

            const effectiveSurchargeRate = baseSurchargeRate * rampUpFactor;
            section899Surcharge = taxableAmount * effectiveSurchargeRate;
            calculationExplanation = `Calculated as: $${taxableAmount.toFixed(2)} (Taxable Amount) * ${baseSurchargeRate * 100}% (Base Surcharge Rate for ${selectedCountryData.name}) * ${rampUpFactor * 100}% (Ramp-up Factor for ${applicableYearInput || 'N/A'}) = $${section899Surcharge.toFixed(2)}. Status: ${countryStatus}.`;
        }


        // --- Display results ---
        resultsDiv.innerHTML = `
            <h3>Estimated Impact for Tax Year ${taxYear || 'N/A'}:</h3>
            <div class="card result-summary">
                <p><strong>Inputs Used:</strong></p>
                <ul>
                    <li>Entity Type: ${entityType || 'Not specified'}</li>
                    <li>Country of Import: ${selectedCountryData.name}</li>
                    <li>Taxable Amount: $${taxableAmount.toFixed(2)}</li>
                    <li>Country Status for Sec 899: ${countryStatus}</li>
                </ul>
                <hr>
                <p><strong>Estimated Section 899 Surcharge:</strong> 
                    <span class="highlight-result">$${section899Surcharge.toFixed(2)}</span>
                </p>
                <p><small>${calculationExplanation}</small></p>
            </div>
            <p class="disclaimer"><strong>Important Disclaimer:</strong> This is a simplified estimate for illustrative and educational purposes only. It is based on the hypothetical Section 899 framework and data provided. This calculation does not constitute tax advice. Always consult with a qualified tax professional for advice tailored to your specific circumstances.</p>
        `;
        console.log('Calculator form submitted and results displayed.');
    }

    async function init() {
        form = document.getElementById('impact-estimator-form');
        resultsDiv = document.getElementById('calculator-results');

        if (!form) {
            // Not on the calculator page, or form element is missing.
            // console.log('Calculator form not found on this page, skipping init.');
            return; 
        }
        if (!resultsDiv) {
            console.error('Calculator results area (calculator-results) not found!');
            // Optionally, create a placeholder if critical, or disable form
            form.innerHTML = '<p class="error">Results display area is missing. Calculator cannot function.</p>';
            return;
        }

        const dataLoaded = await loadTaxData();
        if (dataLoaded) {
            form.addEventListener('submit', calculateImpact);
            console.log('Impact Estimator (Calculator) initialized.');
        } else {
            console.error('Calculator initialization failed due to missing tax data.');
            // The error message should already be in resultsDiv from loadTaxData
        }
    }

    return {
        init
    };
})();
