import React from "react";
import { GitHubUser } from "../types/github";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, User } from "lucide-react";

interface UserListProps {
  users: GitHubUser[];
  onUserSelect: (user: GitHubUser) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onUserSelect,
  isLoading = false,
  error,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, user: GitHubUser) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onUserSelect(user);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <span className="text-sm text-muted-foreground">
              Searching users...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-0">
        <div className="text-sm text-muted-foreground px-4 py-2 border-b">
          Showing users for your search
        </div>
        <div className="max-h-96 overflow-y-auto">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-between h-auto p-4 rounded-none border-b last:border-b-0 hover:bg-accent"
              onClick={() => onUserSelect(user)}
              onKeyDown={(e) => handleKeyDown(e, user)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                      className="w-8 h-8 rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User
                        className="h-4 w-4 text-muted-foreground"
                        data-testid="user-icon"
                      />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{user.login}</p>
                  {user.type && (
                    <p className="text-xs text-muted-foreground">{user.type}</p>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
