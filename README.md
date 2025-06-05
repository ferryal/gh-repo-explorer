# GitHub Repository Explorer

A modern React application for exploring GitHub users and their repositories. Built with TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

- **User Search**: Search for up to 5 GitHub users with a username similar to your input
- **Repository Explorer**: View all public repositories for any selected user with unlimited pagination
- **User Contributions**: Comprehensive contribution statistics including:
  - Total commits, pull requests, and issues in the last year
  - Recent activity feed with timestamps
  - Repository count and contribution insights
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile
- **Modern UI**: Beautiful interface built with shadcn/ui components and Tailwind CSS
- **Keyboard Navigation**: Full keyboard accessibility support
- **Loading States**: Smooth loading indicators and error handling
- **Error Handling**: Graceful handling of API errors, rate limits, and "user not found" scenarios
- **Type Safety**: Built with TypeScript for robust development

## 🛠 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Create React App** - Zero-config React setup
- **TanStack Query** - Powerful data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful icon library
- **Jest & React Testing Library** - Comprehensive testing utilities

## 📋 Prerequisites

- Node.js v23.6.1 or higher
- npm or yarn package manager

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gh-repo-explorer
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production
- `npm run eject` - One-way operation to eject from CRA

## 🎯 Usage

1. **Search Users**: Enter a GitHub username in the search field and click "Search" or press Enter
2. **Browse Results**: View up to 5 matching users with their avatars and basic information
3. **Select User**: Click on any user to view their detailed profile and repositories
4. **View Contributions**: See comprehensive contribution statistics including:
   - Commit count from the last year
   - Pull requests and issues created
   - Total number of repositories
   - Recent activity timeline
5. **Explore Repositories**: Browse all public repositories (unlimited pagination) with details like:
   - Repository name and description
   - Star and fork counts
   - Programming language
   - Last update date
   - Topic tags
6. **Navigate**: Use the "Back to Users" button to return to the search results

## 🎨 Design Features

- **Mobile-First**: Responsive design that works seamlessly across all devices
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML
- **Loading States**: Visual feedback during API calls with skeleton screens
- **Error Handling**: User-friendly error messages for API failures, rate limits, and empty results
- **Clean UI**: Modern card-based layout with hover effects and smooth transitions
- **Contribution Visualization**: Interactive stats display with activity timeline

## 🧪 Testing

The application includes comprehensive test coverage with **103 tests across 6 test suites**:

### Test Coverage

- **App.test.tsx**: 16 tests covering main application flow, search functionality, and error handling
- **App.integration.test.tsx**: 5 integration tests covering end-to-end user workflows
- **UserContributions.test.tsx**: 35 tests covering contribution statistics and activity display
- **UserList.test.tsx**: Component testing for user list functionality
- **SearchForm.test.tsx**: Form validation and interaction testing
- **githubApi.test.ts**: API service testing with comprehensive mock scenarios

### Test Types

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: End-to-end user flow testing with mock API responses
- **API Service Tests**: GitHub API client testing with error scenarios
- **Accessibility Tests**: Keyboard navigation and ARIA compliance
- **Error Handling Tests**: Rate limiting, network errors, and edge cases

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage --watchAll=false
```

## 🏗 Architecture

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── SearchForm.tsx  # Search input component
│   ├── UserList.tsx    # User results display
│   ├── RepositoryList.tsx # Repository display
│   └── UserContributions.tsx # Contribution statistics
├── hooks/              # Custom React hooks
│   └── useGitHubQueries.ts # TanStack Query hooks
├── services/           # API services
│   └── githubApi.ts    # GitHub API client with pagination
├── types/              # TypeScript type definitions
│   └── github.ts       # GitHub API types
├── lib/                # Utility functions
│   └── utils.ts        # Class name utilities
└── __tests__/          # Test files
    ├── App.test.tsx
    ├── App.integration.test.tsx
    └── components/     # Component-specific tests
```

### State Management

- **TanStack Query**: Handles server state, caching, and data fetching with automatic retries
- **React State**: Local component state for form inputs and UI interactions
- **Query Invalidation**: Smart cache invalidation for optimal performance

### Data Flow

1. User inputs search query
2. TanStack Query fetches users from GitHub API
3. Results cached for performance
4. User selection triggers parallel fetches for:
   - User details
   - Repositories (with pagination)
   - User events (for contributions)
5. All data cached with smart invalidation strategies

## 🔧 Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:

- Custom color scheme supporting light/dark themes
- Extended utilities for spacing and animations
- shadcn/ui integration with CSS variables
- Responsive breakpoints for mobile-first design

### API Configuration

- GitHub API v3 endpoints
- Automatic pagination for repositories (unlimited results)
- Rate limiting handled gracefully with user feedback
- Error boundaries for API failures
- Retry logic for transient failures

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Environment Variables

No environment variables required - the app uses public GitHub API endpoints.

### Performance Optimizations

- Code splitting and lazy loading
- Image optimization for avatars
- TanStack Query caching
- Responsive image loading

## 📝 API Reference

The application uses the GitHub REST API v3:

- **Search Users**: `GET /search/users?q={query}&per_page={limit}`
- **Get User**: `GET /users/{username}`
- **Get Repositories**: `GET /users/{username}/repos?sort=updated&direction=desc&per_page=100&page={page}`
- **Get User Events**: `GET /users/{username}/events/public?per_page=100`

**Rate Limits**: 60 requests per hour for unauthenticated requests.

**Pagination**: Automatically handles pagination for repositories to display unlimited results.

## 🐛 Known Issues

- GitHub API rate limiting may affect heavy usage (60 requests/hour limit)
- Repository topics may not display for older repositories
- Some contribution statistics depend on public event availability (last 90 days)

## 📜 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created as a technical demonstration of modern React development practices with comprehensive testing and accessibility features.

---

**Note**: This application is for demonstration purposes and uses the public GitHub API without authentication. For production use, consider implementing GitHub OAuth for higher rate limits and access to private repositories.
