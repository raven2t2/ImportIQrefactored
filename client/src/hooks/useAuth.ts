import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check for trial user in localStorage as a fallback authentication method
  const trialEmail = localStorage.getItem('trial_user_email');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Consider user authenticated if they have an active trial or are logged in
  const isAuthenticated = !!user || !!trialEmail;

  return {
    user: user || (trialEmail ? { email: trialEmail } : null),
    isLoading,
    isAuthenticated,
  };
}