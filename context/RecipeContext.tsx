import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Recipe, RecipeContextType } from '../types/recipe';
import { recipeService } from '../services/recipeService';
import { useAuth } from './AuthContext';

// Recipe Reducer
type RecipeAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const recipeReducer = (state: any, action: RecipeAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload, loading: false };
    case 'ADD_RECIPE':
      return { ...state, recipes: [action.payload, ...state.recipes] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((recipe: Recipe) =>
          recipe.id === action.payload.id ? action.payload : recipe
        ),
      };
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter((recipe: Recipe) => recipe.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, {
    recipes: [],
    loading: false,
    error: null,
  });
  
  const { user } = useAuth();

  // Implementation similar to TaskContext but for recipes
  const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'userId'>) => {
    // Implementation
  };

  // ... other methods

  return (
    <RecipeContext.Provider value={{ ...state, addRecipe, updateRecipe, deleteRecipe, searchRecipes, refreshRecipes }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};