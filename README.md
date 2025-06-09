# Section 899 Educational Tool

A dynamic, single-page web application designed to provide an educational overview of Section 899 of the Internal Revenue Code. All content is loaded dynamically from JSON files, allowing for easy updates and maintenance.

## Features

- **Dynamic Content Loading**: All informational pages (Home, Key Provisions, Legislation, FAQ) load their content from respective JSON files in the `site/data/` directory.
- **Interactive Navigation**: Smooth single-page application (SPA) style navigation using URL hash fragments.
- **Key Provisions Page**: Dynamically renders structured content including paragraphs, lists, definition lists, and Mermaid.js flowcharts from `site/data/key_provisions.json`.
- **Legislation Page**: Displays legislative text from `site/data/legislation.json`.
- **Glossary Integration**: Terms marked with the class `glossary-term` in the content will automatically display tooltips with definitions fetched from `site/data/glossary.json`. This functionality works for both statically and dynamically loaded content.
- **Impact Estimator**: A basic calculator to estimate potential tax impacts (placeholder functionality).
- **FAQ Page**: Dynamically loads frequently asked questions from `site/data/faq.json`.

## Project Structure

The main application files are located within the `site/` directory:
- `index.html`: The main entry point for the single-page application.
- `css/`: Contains stylesheets.
- `js/`: Contains JavaScript modules for navigation, page-specific logic, and utilities (e.g., `navigation.js`, `home.js`, `key_provisions.js`, `glossary-links.js`).
- `data/`: Contains JSON files that drive the content of the application (e.g., `home_content.json`, `key_provisions.json`, `legislation.json`, `glossary.json`, `faq.json`).
- `pages/`: Contains HTML partials for each section, which are loaded into `index.html` by the navigation script.

## Running the Application Locally

1.  **Ensure you have Python installed.** This is used to run a simple HTTP server.
2.  **Navigate to the `site` directory** in your terminal:
    ```bash
    cd c:\Users\kyleb\CascadeProjects\899_site\site
    ```
3.  **Start the Python HTTP server**:
    ```bash
    python -m http.server 8000
    ```
4.  **Open your web browser** and go to `http://localhost:8000/index.html`.

## Development Notes

- The application relies heavily on JavaScript for dynamic content rendering and navigation.
- Key JavaScript modules include:
    - `js/navigation.js`: Handles routing and loading page content and scripts.
    - `js/key_provisions.js`: Manages fetching and rendering content for the Key Provisions page, including Mermaid diagrams.
    - `js/glossary-links.js`: Provides the global `window.applyGlossaryTooltips` function for adding interactive glossary term definitions.
- Ensure consistency in URL hash strings (e.g., `#key-provisions` vs. `#key_provisions`) across routing definitions, link generation, and conditional script execution.

## Contributing

(To be defined - for now, focus on local development and testing.)
