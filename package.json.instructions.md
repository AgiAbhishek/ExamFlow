# Package.json Scripts Guide

This document explains the available npm scripts in the project.

## Available Scripts

### `npm run dev`
- **Description**: Starts the development server
- **What it does**: 
  - Runs both backend (Express server on port 5000) and frontend (Vite dev server on port 5173)
  - Enables hot reloading for both client and server
  - Automatically opens your browser to the application
- **Use**: Primary command for development

### `npm run build`
- **Description**: Builds the application for production
- **What it does**:
  - Compiles TypeScript to JavaScript
  - Bundles and optimizes frontend assets
  - Prepares the app for deployment
- **Use**: Before deploying to production

### `npm run start`
- **Description**: Starts the production server
- **What it does**: Runs the built application
- **Use**: After running `npm run build` for production deployment

### `npm install`
- **Description**: Installs all project dependencies
- **What it does**: Downloads and installs packages listed in package.json
- **Use**: First command to run after cloning the project

## Development Workflow

1. **Initial Setup**:
   ```bash
   npm install
   ```

2. **Development**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```