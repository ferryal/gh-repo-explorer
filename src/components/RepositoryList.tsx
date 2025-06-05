import React from "react";
import { GitHubRepository, GitHubUser } from "../types/github";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  Code,
  ChevronUp,
} from "lucide-react";

interface RepositoryListProps {
  user: GitHubUser;
  repositories: GitHubRepository[];
  onBackToUsers: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  user,
  repositories,
  onBackToUsers,
  isLoading = false,
  error,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, url: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBackToUsers();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* User Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar_url}
                alt={`${user.login}'s avatar`}
                className="w-16 h-16 rounded-full"
                loading="lazy"
              />
              <div>
                <CardTitle className="text-xl">{user.login}</CardTitle>
                {user.name && (
                  <p className="text-muted-foreground">{user.name}</p>
                )}
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.bio}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  {user.public_repos !== undefined && (
                    <span>{user.public_repos} repositories</span>
                  )}
                  {user.followers !== undefined && (
                    <span>{user.followers} followers</span>
                  )}
                  {user.following !== undefined && (
                    <span>{user.following} following</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onBackToUsers}
              onKeyDown={handleBackKeyDown}
              className="shrink-0"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Repositories */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span className="text-muted-foreground">
                Loading repositories...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && repositories.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              No public repositories found for this user.
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && repositories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map((repo) => (
            <Card
              key={repo.id}
              className="group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                window.open(repo.html_url, "_blank", "noopener,noreferrer")
              }
              onKeyDown={(e) => handleKeyDown(e, repo.html_url)}
              tabIndex={0}
              role="button"
              aria-label={`Open ${repo.name} repository`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {repo.name}
                  </CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                </div>
                {repo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {repo.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="h-3 w-3" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(repo.updated_at)}</span>
                  </div>
                </div>
                {repo.language && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Code className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">
                      {repo.language}
                    </span>
                  </div>
                )}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                        +{repo.topics.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
