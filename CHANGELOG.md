# Changelog

All notable changes to the AI Resume & Interview Strategy Builder project will be documented in this file.

## [1.1.0] - 2026-10-22

### Added
- Created comprehensive project documentation in [README.md](file:///Users/laptopchoice/Documents/fullstack_projects/ai_resume_builder/README.md) covering architecture, environment setup, and API endpoints.
- Added root and frontend environment templates (`.env.example`) to document all necessary credentials and configuration keys.
- Added visual error notifications on login and registration pages to inform users when authentication fails.
- Added root-level `.gitignore` to safeguard system artifacts, build directories, and environment credentials.

### Fixed
- Fixed an authorization flaw that allowed any user to view or export another user's interview reports and resume strategies.
- Fixed a bug where uploaded avatar images were stored incorrectly as raw objects instead of valid image URLs.
- Fixed potential server crashes on registration and login by adding input validation and error handling for malformed requests.
- Fixed insecure session handling by attaching HTTP-only and SameSite flags to authentication cookies.
- Fixed strict CORS rejection by replacing wildcard origins with dynamic origin validation.
- Fixed duplicate data requests when viewing an interview strategy page.

### Changed
- Standardized file upload support on the home page to PDF documents to ensure compatibility with backend resume parsing.
- Updated frontend network services to dynamically adapt API endpoints for both local development and production deployments.
