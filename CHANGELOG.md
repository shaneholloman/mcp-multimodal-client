# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.6] - 2025-01-09

### Added

- Added systemprompt-agent-server and dotenv dependencies
- Added aria-labels for improved accessibility in control tray components

### Changed

- Optimized audio processing with batched queue system
- Improved error handling in LiveAPIContext and multimodal client
- Enhanced volume meter performance with debouncing
- Removed unnecessary console logging statements
- Refactored audio streaming for better performance

## [0.3.5] - 2025-01-08

### Added

- Added GET endpoint for `/api/config/agent` with proper error handling
- Added CORS support for API endpoints
- Added strict port configuration for dev and preview servers

### Changed

- Updated config API endpoint from `/config/agent.config.json` to `/api/config/agent`
- Enhanced error handling and validation in config loading
- Improved API middleware with better error responses
- Removed compiled vite config files in favor of TypeScript source

## [0.3.4] - 2025-01-08

### Changed

- Reorganized language model documentation directories from `__llms__` to `__llm__`
- Updated component file structure for better organization
- Improved documentation with new language model guides
- Refined test configurations and outputs

### Added

- Added new documentation guides for various components and features
- Added markdown linting configuration

### Removed

- Cleaned up obsolete architecture documentation

## [0.3.3] - 2025-01-08

### Added

- Added new `start` script combining build and preview with proxy server

### Changed

- Updated font path in global CSS from `/console/font/` to `/font/`
- Removed unused `paths-to-remove.txt` file

## [0.3.2] - 2025-01-08

### Changed

- Removed unnecessary React imports across components for better code cleanliness
- Improved button component implementations with better props handling
- Enhanced server configuration to support both Windows and Linux environments
- Optimized component rendering with proper cleanup and error handling
- Updated type definitions for better type safety

## [0.3.1] - 2025-01-08

### Changed

- Updated .gitignore to better manage configuration and extension files
- Improved configuration file organization structure

## [0.2.1] - 2025-01-08

### Added

- Added test coverage for AgentRegistryContext
- Added documentation for agent registry feature

### Fixed

- Fixed commit state script output path

## [0.2.0] - 2024-01-08

### Breaking Changes

- Removed PromptContext in favor of AgentRegistry for better agent management
- Restructured agent configuration system with new data model
- Updated routing structure for agent-related pages

### Added

- New AgentRegistry context for centralized agent management
- Improved agent configuration UI with better tool selection
- Enhanced settings page with detailed voice configuration display

### Changed

- Refactored App.tsx with cleaner component structure
- Updated build configuration in vite.config.ts and tsconfig.json
- Improved test coverage for LiveAPIContext
- Streamlined agent creation workflow

### Fixed

- Fixed tool selection and management in agent configuration
- Improved error handling in LiveAPIContext
- Enhanced type safety across components

## [0.3.0] - 2025-01-08

### Added

- Added collapsible sidebar functionality with compact view
- Added agent selector dropdown in control tray
- Added new application icons (icon.png, icon.svg)
- Added new test file for sidebar items

### Changed

- Updated navigation icons and styling for better UX
- Improved button states and loading indicators
- Updated page title and metadata with better SEO
- Updated agent execution route from `/agents/execute/:agentName` to `/agent/:id`
- Refined control tray UI with modern styling

### Fixed

- Improved button loading state display in DynamicButton
- Enhanced sidebar item styling and accessibility
