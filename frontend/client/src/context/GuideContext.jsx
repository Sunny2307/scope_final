import { createContext } from "react";

/**
 * Creates the guide context.
 * This defines the default shape of the data that will be available
 * to all components wrapped by the GuideContextProvider.
 */
export const GuideContext = createContext({
  // Guide user data
  user: null,
  isLoading: true,
  
  // Handler functions
  handleLogout: () => {},
});
