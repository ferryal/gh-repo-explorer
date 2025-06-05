import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { githubApi, GitHubApiError } from "../services/githubApi";

export const useSearchUsers = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => githubApi.searchUsers(query, 5),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof GitHubApiError && error.status === 403) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 3;
    },
  });
};

export const useUserRepositories = (
  username: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["repositories", username],
    queryFn: () => githubApi.getUserRepositories(username),
    enabled: enabled && username.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof GitHubApiError && error.status === 403) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 3;
    },
  });
};

export const useUser = (username: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => githubApi.getUser(username),
    enabled: enabled && username.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof GitHubApiError &&
        (error.status === 403 || error.status === 404)
      ) {
        return false; // Don't retry rate limit or not found errors
      }
      return failureCount < 3;
    },
  });
};

export const useSearchUsersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query }: { query: string }) =>
      githubApi.searchUsers(query, 5),
    onSuccess: (data, variables) => {
      // Update the cache with the new data
      queryClient.setQueryData(["users", "search", variables.query], data);
    },
    onError: (error) => {
      console.error("Search users error:", error);
    },
  });
};
