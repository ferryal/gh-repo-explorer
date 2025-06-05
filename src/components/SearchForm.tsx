import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "Enter username",
}) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateUsername = (value: string) => {
    if (!value.trim()) return "Username is required";
    if (value.length > 39) return "Username must be less than 40 characters";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const validationError = validateUsername(trimmedUsername);

    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    setError(null);
    onSearch(trimmedUsername);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Validate on change if touched
    if (touched) {
      const validationError = validateUsername(value);
      setError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateUsername(username);
    setError(validationError);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            value={username}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }
            disabled={isLoading}
            autoComplete="off"
            autoFocus
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="sm:w-auto w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
