# Frederick Casey-Housand - Personal Website

A simple, clean portfolio website. No frameworks, no build tools - just HTML and CSS.

## Structure

```
personal-website/
├── index.html          # Main page
├── styles.css          # Styling
└── public/            # Your images/media (create this folder)
```

## Running Locally

No build process needed. Just open `index.html` in your browser, or use a simple server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have it)
npx serve
```

Then open `http://localhost:8000`

## Adding Media

1. Create a `public` folder
2. Add your images there
3. Replace the placeholder divs in `index.html` with actual `<img>` tags

Example:
```html
<!-- Replace this: -->
<div class="placeholder-media">
    [Add screenshots: Architecture diagrams]
</div>

<!-- With this: -->
<img src="public/context-engine-diagram.png" alt="Context Engine Architecture" style="width: 100%; margin: 16px 0;">
```

## Deployment

### GitHub Pages
1. Push to GitHub
2. Go to Settings → Pages
3. Select main branch
4. Your site will be at `https://yourusername.github.io/personal-website`

### Netlify
Drag and drop the entire folder to [Netlify](https://app.netlify.com/drop)

### Vercel
```bash
npx vercel
```

## Customization

All styling is in `styles.css`. The design follows a minimal aesthetic inspired by simple, text-focused portfolios.

Typography sizes:
- h1: 30pt (name)
- h2: 16pt (section headers)
- h3: 11pt (role/project titles)
- body: 11pt
- meta: 9pt

Colors:
- Text: #282828
- Links: #282828 with underline
- Meta text: #666
- Footer: #999

© 2025 Frederick Casey-Housand
