import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchForm } from "./components/SearchForm";
import { UserList } from "./components/UserList";
import { RepositoryList } from "./components/RepositoryList";
import {
  useSearchUsers,
  useUserRepositories,
  useUser,
} from "./hooks/useGitHubQueries";
import { GitHubUser } from "./types/github";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function GitHubExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);

  // Search users query
  const {
    data: users = [],
    isLoading: isSearchingUsers,
    error: searchError,
  } = useSearchUsers(searchQuery);

  // Get full user details when a user is selected
  const { data: fullUserData } = useUser(
    selectedUser?.login || "",
    !!selectedUser
  );

  // Get repositories for selected user
  const {
    data: repositories = [],
    isLoading: isLoadingRepositories,
    error: repositoriesError,
  } = useUserRepositories(selectedUser?.login || "", !!selectedUser);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedUser(null); // Clear selection when searching
  };

  const handleUserSelect = (user: GitHubUser) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  const displayUser = fullUserData || selectedUser;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            GitHub Repository Explorer
          </h1>
          <p className="text-muted-foreground">
            Search for GitHub users and explore their repositories
          </p>
        </div>

        {!selectedUser ? (
          <div className="space-y-6">
            <SearchForm
              onSearch={handleSearch}
              isLoading={isSearchingUsers}
              placeholder="Enter username to search"
            />

            <UserList
              users={users}
              onUserSelect={handleUserSelect}
              isLoading={isSearchingUsers}
              error={searchError?.message || null}
            />
          </div>
        ) : (
          displayUser && (
            <RepositoryList
              user={displayUser}
              repositories={repositories}
              onBackToUsers={handleBackToUsers}
              isLoading={isLoadingRepositories}
              error={repositoriesError?.message || null}
            />
          )
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GitHubExplorer />
    </QueryClientProvider>
  );
}

export default App;
