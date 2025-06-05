import { create } from "zustand";
import { GitHubUser, GitHubRepository } from "../types/github";

interface GitHubStore {
  // State
  searchQuery: string;
  users: GitHubUser[];
  selectedUser: GitHubUser | null;
  repositories: GitHubRepository[];
  isLoadingUsers: boolean;
  isLoadingRepositories: boolean;
  usersError: string | null;
  repositoriesError: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setUsers: (users: GitHubUser[]) => void;
  setSelectedUser: (user: GitHubUser | null) => void;
  setRepositories: (repositories: GitHubRepository[]) => void;
  setIsLoadingUsers: (loading: boolean) => void;
  setIsLoadingRepositories: (loading: boolean) => void;
  setUsersError: (error: string | null) => void;
  setRepositoriesError: (error: string | null) => void;
  resetUsers: () => void;
  resetRepositories: () => void;
}

export const useGitHubStore = create<GitHubStore>((set) => ({
  // Initial state
  searchQuery: "",
  users: [],
  selectedUser: null,
  repositories: [],
  isLoadingUsers: false,
  isLoadingRepositories: false,
  usersError: null,
  repositoriesError: null,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setUsers: (users) => set({ users }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setRepositories: (repositories) => set({ repositories }),
  setIsLoadingUsers: (loading) => set({ isLoadingUsers: loading }),
  setIsLoadingRepositories: (loading) =>
    set({ isLoadingRepositories: loading }),
  setUsersError: (error) => set({ usersError: error }),
  setRepositoriesError: (error) => set({ repositoriesError: error }),
  resetUsers: () => set({ users: [], usersError: null, selectedUser: null }),
  resetRepositories: () => set({ repositories: [], repositoriesError: null }),
}));
