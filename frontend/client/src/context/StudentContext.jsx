import { createContext } from "react";

/**
 * Creates a context specifically for the student dashboard.
 * This will hold student-specific data and actions, keeping it
 * separate from the authentication flow.
 */
export const StudentContext = createContext({
    user: null, // To hold student's profile data
    isLoading: true, // To handle loading state for dashboard data
    handleLogout: () => {}, // Function to handle user logout
});
