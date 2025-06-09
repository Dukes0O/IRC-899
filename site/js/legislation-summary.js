/**
 * Generates human-readable summaries from the legislation JSON
 */
class LegislationSummary {
    constructor(legislationData) {
        this.data = legislationData;
    }

    /**
     * Generate a plain English summary of the entire legislation
     */
    generateFullSummary() {
        let summary = [];
        
        // Add title and introduction
        summary.push(`# ${this.data.title}`);
        summary.push(`**Section ${this.data.section} of the ${this.data.code}**`);
        summary.push('');
        
        // Add effective date if available
        if (this.data.effective_date) {
            summary.push(`*Effective: ${this.data.effective_date}*`);
            summary.push('');
        }
        
        // Add overview
        summary.push('## Overview');
        summary.push('This section modifies the U.S. tax treatment of persons connected with foreign jurisdictions that have been identified as maintaining discriminatory tax practices. Key provisions include:');
        
        // Add key provisions
        const keyProvisions = [];
        this.data.provisions.forEach(provision => {
            if (provision.title && provision.paragraphs) {
                keyProvisions.push(`- **${provision.title} (${provision.subsection})**: ${this.getFirstSentence(provision.paragraphs[0]?.text || '')}`);
            }
        });
        summary = summary.concat(keyProvisions);
        summary.push('');
        
        // Add rate schedule if available
        const rateSchedule = this.getRateSchedule();
        if (rateSchedule) {
            summary.push('## Rate Schedule');
            summary.push('The following rate increases apply to affected taxpayers:');
            summary.push('');
            summary.push('| Year | Rate Increase | Effective Date |');
            summary.push('|------|---------------|-----------------|');
            rateSchedule.forEach(rate => {
                summary.push(`| ${rate.year} | ${rate.percentage_increase}% | ${rate.applicable_date} |`);
            });
            summary.push('');
        }
        
        // Add key definitions
        if (this.data.definitions && this.data.definitions.length > 0) {
            summary.push('## Key Definitions');
            this.data.definitions.forEach(def => {
                summary.push(`- **${def.term}**: ${this.getFirstSentence(def.definition)}`);
            });
            summary.push('');
        }
        
        // Add implementation notes if available
        if (this.data.implementation_notes) {
            summary.push('## Implementation Notes');
            Object.entries(this.data.implementation_notes).forEach(([key, value]) => {
                const formattedKey = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
                summary.push(`- **${formattedKey}**: ${value}`);
            });
            summary.push('');
        }
        
        // Add related sections
        if (this.data.related_sections && this.data.related_sections.length > 0) {
            summary.push('## Related Code Sections');
            this.data.related_sections.forEach(section => {
                summary.push(`- ${section}`);
            });
            summary.push('');
        }
        
        return summary.join('\n');
    }
    
    /**
     * Generate a short summary suitable for tooltips or quick reference
     */
    generateQuickSummary() {
        const rateSchedule = this.getRateSchedule();
        const firstRate = rateSchedule && rateSchedule[0];
        
        let summary = [];
        summary.push(`**Section ${this.data.section} - ${this.data.title}**`);
        summary.push('');
        
        if (firstRate) {
            summary.push(`- Initial rate increase: ${firstRate.percentage_increase}%`);
            summary.push(`- Effective date: ${firstRate.applicable_date}`);
        }
        
        const keyTerms = this.data.definitions?.slice(0, 3).map(d => d.term).join(', ') || '';
        if (keyTerms) {
            summary.push(`- Key terms: ${keyTerms}`);
        }
        
        return summary.join('\n');
    }
    
    /**
     * Extract rate schedule from the legislation data
     */
    getRateSchedule() {
        for (const provision of this.data.provisions || []) {
            for (const para of provision.paragraphs || []) {
                if (para.applicable_rates) {
                    return para.applicable_rates;
                }
            }
        }
        return null;
    }
    
    /**
     * Helper to get the first sentence of a text
     */
    getFirstSentence(text) {
        if (!text) return '';
        const match = text.match(/^.*?[.!?]+/);
        return match ? match[0] : text;
    }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegislationSummary;
} else if (window) {
    window.LegislationSummary = LegislationSummary;
}
