# Documentation Directory

This directory contains organized copies of all documentation files from across the project. The files are automatically generated using the `scripts/organize-docs.js` script.

## File Organization

- Each file in this directory is a copy of a documentation file from elsewhere in the project
- Files are renamed using a semantic naming scheme based on their location and purpose
- Each file contains a reference comment at the top indicating its original location
- README files are converted to `{directory}-guide.md` format
- Component and feature documentation includes their context in the filename

## Naming Convention

- Files use kebab-case naming (e.g., `feature-name-guide.md`)
- README.md files are renamed to `{context}-guide.md` (e.g., `config-guide.md`)
- Path context is included when needed to avoid duplicates
- Special characters are converted to readable text

## Regenerating Documentation

To regenerate this documentation:

```bash
node scripts/organize-docs.js
```

This will:

1. Find all markdown files in the project
2. Create semantic copies in this directory
3. Add source reference comments
4. Handle naming conflicts automatically
