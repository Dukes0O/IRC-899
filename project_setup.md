# Project Setup Guide: Section 899 Educational Tool

## 1. Prerequisites

### 1.1 Required Software
- [Git](https://git-scm.com/) (v2.30+)
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Code editor (VS Code recommended)

### 1.2 Recommended VS Code Extensions
- Live Server
- ESLint
- Prettier - Code formatter
- HTML CSS Support
- IntelliSense for CSS class names

## 2. Getting Started

### 2.1 Clone the Repository
```bash
git clone [repository-url]
cd 899_site
```

### 2.2 Project Structure
```
899_site/
├── site/                 # Main application directory
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── data/             # JSON data files
│   └── pages/            # HTML pages
├── .gitignore           # Git ignore file
├── README.md            # Project documentation
└── technical_specification.md  # Technical specifications
```

### 2.3 Local Development
1. Open the project in VS Code
2. Install the recommended extensions when prompted
3. Right-click on `site/index.html` and select "Open with Live Server"
4. The application should open in your default browser at `http://127.0.0.1:5500/site/`

## 3. Development Workflow

### 3.1 Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches (e.g., `feature/calculator`)
- `bugfix/*` - Bug fix branches

### 3.2 Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Stage changes: `git add .`
4. Commit changes: `git commit -m "Description of changes"`
5. Push to remote: `git push origin feature/your-feature-name`
6. Create a Pull Request to merge into `develop`

## 4. Code Style & Quality

### 4.1 JavaScript
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ES6+ features
- JSDoc comments for functions

### 4.2 HTML
- Semantic HTML5 elements
- Accessible markup (ARIA labels where needed)
- Responsive design principles

### 4.3 CSS
- BEM (Block Element Modifier) methodology
- CSS Custom Properties for theming
- Mobile-first approach

## 5. Testing

### 5.1 Manual Testing
- Cross-browser testing
- Mobile responsiveness
- Accessibility testing

### 5.2 Automated Testing (Future)
- Unit tests with Jest
- E2E tests with Cypress

## 6. Building for Production

### 6.1 Build Process (Future)
1. Minify CSS and JavaScript
2. Optimize images
3. Generate production-ready files in `/dist`

### 6.2 Deployment (Future)
- Static site hosting (Netlify, Vercel, or GitHub Pages)
- CI/CD pipeline setup

## 7. Troubleshooting

### 7.1 Common Issues
- **Page not loading**: Ensure Live Server is running
- **Styles not applying**: Check browser console for 404 errors
- **JavaScript errors**: Check for syntax errors in the console

### 7.2 Getting Help
- Check the project's README.md
- Review the technical specification
- Open an issue in the repository

## 8. Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)
