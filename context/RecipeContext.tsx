// context/RecipeContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Recipe, RecipeContextType, RecipeFormData } from '../types/recipe';
import { recipeService } from '../services/recipeService';
import { useAuth } from './AuthContext';

// Recipe reducer actions
type RecipeAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_PUBLIC_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SEARCH_RESULTS'; payload: Recipe[] }
  | { type: 'CLEAR_SEARCH' };

// Recipe reducer
const recipeReducer = (state: any, action: RecipeAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload, loading: false };
    case 'SET_PUBLIC_RECIPES':
      return { ...state, publicRecipes: action.payload, loading: false };
    case 'ADD_RECIPE':
      return { 
        ...state, 
        recipes: [action.payload, ...state.recipes]
      };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((recipe: Recipe) =>
          recipe.id === action.payload.id ? action.payload : recipe
        ),
        publicRecipes: state.publicRecipes.map((recipe: Recipe) =>
          recipe.id === action.payload.id ? action.payload : recipe
        )
      };
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter((recipe: Recipe) => recipe.id !== action.payload),
        publicRecipes: state.publicRecipes.filter((recipe: Recipe) => recipe.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, loading: false };
    case 'CLEAR_SEARCH':
      return { ...state, searchResults: [] };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  recipes: [],
  publicRecipes: [],
  searchResults: [],
  loading: false,
  error: null,
};

// Create context
const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Recipe provider component
export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState);
  const { user, userProfile, isAdmin, isCustomer } = useAuth();

  // Load user recipes when user changes
  useEffect(() => {
    if (user && userProfile) {
      refreshUserRecipes();
    }
  }, [user, userProfile]);

  // Load public recipes on mount
  useEffect(() => {
    refreshPublicRecipes();
  }, []);

  // Add new recipe
  const addRecipe = async (recipeData: RecipeFormData): Promise<void> => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Validate recipe data
      if (!recipeData.title?.trim()) {
        throw new Error('Recipe title is required');
      }
      if (!recipeData.ingredients?.length) {
        throw new Error('At least one ingredient is required');
      }
      if (!recipeData.instructions?.trim()) {
        throw new Error('Cooking instructions are required');
      }

      // Create recipe
      const recipeId = await recipeService.createRecipe(recipeData, userProfile);

      // Create full recipe object
      const newRecipe: Recipe = {
        id: recipeId,
        ...recipeData,
        createdBy: userProfile.uid,
        createdByName: userProfile.displayName,
        isApproved: userProfile.role === 'admin',
        isPublic: userProfile.role === 'admin',
        views: 0,
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: 'ADD_RECIPE', payload: newRecipe });

      // If admin recipe, also add to public recipes
      if (userProfile.role === 'admin') {
        dispatch({ type: 'SET_PUBLIC_RECIPES', payload: [newRecipe, ...state.publicRecipes] });
      }

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update recipe
  const updateRecipe = async (id: string, updates: Partial<RecipeFormData>): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      // Validate updates
      if (updates.title && !updates.title.trim()) {
        throw new Error('Recipe title cannot be empty');
      }
      if (updates.ingredients && !updates.ingredients.length) {
        throw new Error('At least one ingredient is required');
      }
      if (updates.instructions && !updates.instructions.trim()) {
        throw new Error('Cooking instructions cannot be empty');
      }

      await recipeService.updateRecipe(id, updates);

      // Find and update recipe in local state
      const existingRecipe = state.recipes.find((recipe: Recipe) => recipe.id === id);
      if (existingRecipe) {
        const updatedRecipe: Recipe = {
          ...existingRecipe,
          ...updates,
          updatedAt: new Date()
        };
        dispatch({ type: 'UPDATE_RECIPE', payload: updatedRecipe });
      }

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Delete recipe
  const deleteRecipe = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      await recipeService.deleteRecipe(id);
      dispatch({ type: 'DELETE_RECIPE', payload: id });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Search recipes
  const searchRecipes = async (searchTerm: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (!searchTerm.trim()) {
        dispatch({ type: 'CLEAR_SEARCH' });
        return;
      }

      // Search in public recipes if customer, all recipes if admin
      const results = await recipeService.searchRecipes(
        searchTerm, 
        isCustomer() // Only search public recipes for customers
      );

      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Filter recipes by category
  const filterByCategory = (category: string): Recipe[] => {
    const recipesToFilter = isAdmin() ? state.recipes : state.publicRecipes;
    
    if (!category) return recipesToFilter;
    
    return recipesToFilter.filter((recipe: Recipe) => recipe.category === category);
  };

  // Refresh user's own recipes
  const refreshUserRecipes = async (): Promise<void> => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const userRecipes = await recipeService.getUserRecipes(user.uid);
      dispatch({ type: 'SET_RECIPES', payload: userRecipes });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh public recipes
  const refreshPublicRecipes = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const publicRecipes = await recipeService.getPublicRecipes();
      dispatch({ type: 'SET_PUBLIC_RECIPES', payload: publicRecipes });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Increment recipe views
  const incrementViews = async (id: string): Promise<void> => {
    try {
      await recipeService.incrementViews(id);

      // Update local state
      const updatedRecipes = state.publicRecipes.map((recipe: Recipe) =>
        recipe.id === id ? { ...recipe, views: recipe.views + 1 } : recipe
      );
      dispatch({ type: 'SET_PUBLIC_RECIPES', payload: updatedRecipes });

    } catch (error: any) {
      console.error('Error incrementing views:', error);
      // Don't show error to user for this non-critical operation
    }
  };

  // Toggle like on recipe
  const toggleLike = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('Please login to like recipes');
    }

    try {
      const isLiked = await recipeService.toggleLike(id, user.uid);

      // Update local state
      const updateRecipesList = (recipes: Recipe[]) =>
        recipes.map((recipe: Recipe) =>
          recipe.id === id
            ? {
                ...recipe,
                likes: isLiked ? recipe.likes + 1 : recipe.likes - 1
              }
            : recipe
        );

      dispatch({ type: 'SET_PUBLIC_RECIPES', payload: updateRecipesList(state.publicRecipes) });
      dispatch({ type: 'SET_RECIPES', payload: updateRecipesList(state.recipes) });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Get popular recipes
  const getPopularRecipes = async (): Promise<Recipe[]> => {
    try {
      return await recipeService.getPopularRecipes();
    } catch (error: any) {
      console.error('Error fetching popular recipes:', error);
      return [];
    }
  };

  // Get recipes by category
  const getRecipesByCategory = async (category: string): Promise<Recipe[]> => {
    try {
      return await recipeService.getRecipesByCategory(category, isCustomer());
    } catch (error: any) {
      console.error('Error fetching recipes by category:', error);
      return [];
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Clear search results
  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  // Context value
  const value: RecipeContextType = {
    ...state,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    filterByCategory,
    refreshUserRecipes,
    refreshPublicRecipes,
    incrementViews,
    toggleLike,
    getPopularRecipes: async () => await getPopularRecipes(),
    getRecipesByCategory: async (category: string) => await getRecipesByCategory(category),
    clearError,
    clearSearch,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

// Custom hook to use recipe context
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

// Admin-specific recipe context for admin operations
export const useAdminRecipes = () => {
  const { isAdmin } = useAuth();
  const context = useContext(RecipeContext);
  
  if (!context) {
    throw new Error('useAdminRecipes must be used within RecipeProvider');
  }
  
  if (!isAdmin()) {
    throw new Error('Admin access required');
  }

  // Admin-specific operations
  const getAllRecipes = async (): Promise<Recipe[]> => {
    try {
      return await recipeService.getAllRecipes();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const getPendingRecipes = async (): Promise<Recipe[]> => {
    try {
      return await recipeService.getPendingRecipes();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const approveRecipe = async (
    recipeId: string, 
    isApproved: boolean, 
    makePublic: boolean = true
  ): Promise<void> => {
    const { userProfile } = useAuth();
    if (!userProfile) throw new Error('Admin not authenticated');

    try {
      await recipeService.approveRecipe(
        recipeId, 
        isApproved, 
        userProfile.uid, 
        userProfile.displayName,
        makePublic
      );
      
      // Refresh recipes after approval
      context.refreshPublicRecipes();
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const deleteRecipeByAdmin = async (recipeId: string): Promise<void> => {
    const { userProfile } = useAuth();
    if (!userProfile) throw new Error('Admin not authenticated');

    try {
      await recipeService.deleteRecipeByAdmin(
        recipeId, 
        userProfile.uid, 
        userProfile.displayName
      );
      
      // Update local state
      context.dispatch?.({ type: 'DELETE_RECIPE', payload: recipeId });
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    ...context,
    getAllRecipes,
    getPendingRecipes,
    approveRecipe,
    deleteRecipeByAdmin,
  };
};