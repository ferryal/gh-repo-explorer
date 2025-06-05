import React from "react";
import { GitHubContributionStats, GitHubEvent } from "../types/github";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Calendar,
  Activity,
  Code,
  Star,
  GitFork,
} from "lucide-react";

interface UserContributionsProps {
  stats: GitHubContributionStats;
  isLoading?: boolean;
  error?: string | null;
}

export const UserContributions: React.FC<UserContributionsProps> = ({
  stats,
  isLoading = false,
  error,
}) => {
  const formatEventType = (type: string) => {
    switch (type) {
      case "PushEvent":
        return "Pushed commits";
      case "PullRequestEvent":
        return "Pull request";
      case "IssuesEvent":
        return "Issue activity";
      case "CreateEvent":
        return "Created repository";
      case "ForkEvent":
        return "Forked repository";
      case "WatchEvent":
        return "Starred repository";
      default:
        return type.replace("Event", "");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PushEvent":
        return <GitCommit className="h-3 w-3" />;
      case "PullRequestEvent":
        return <GitPullRequest className="h-3 w-3" />;
      case "IssuesEvent":
        return <AlertCircle className="h-3 w-3" />;
      case "CreateEvent":
        return <Code className="h-3 w-3" />;
      case "ForkEvent":
        return <GitFork className="h-3 w-3" />;
      case "WatchEvent":
        return <Star className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <span className="text-sm text-muted-foreground">
              Loading contributions...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-destructive">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Contributions in the last year</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Contribution Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-lg font-semibold text-primary">
              <GitCommit className="h-4 w-4" />
              <span>{stats.totalCommits}</span>
            </div>
            <p className="text-xs text-muted-foreground">Commits</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-lg font-semibold text-primary">
              <GitPullRequest className="h-4 w-4" />
              <span>{stats.totalPullRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pull Requests</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-lg font-semibold text-primary">
              <AlertCircle className="h-4 w-4" />
              <span>{stats.totalIssues}</span>
            </div>
            <p className="text-xs text-muted-foreground">Issues</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-lg font-semibold text-primary">
              <Code className="h-4 w-4" />
              <span>{stats.totalRepositories}</span>
            </div>
            <p className="text-xs text-muted-foreground">Repositories</p>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Recent Activity</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.recentActivity.map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-muted-foreground">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {formatEventType(event.type)}
                      {event.repo && (
                        <span className="text-muted-foreground ml-1">
                          in {event.repo.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(event.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentActivity.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No recent activity found in the last year.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
