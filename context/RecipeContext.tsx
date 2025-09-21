import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Recipe } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'
import { useAuth } from '@/context/AuthContext'

// Recipe Context Type
interface RecipeContextType {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  searchResults: Recipe[]
  
  // Actions
  addRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
  searchRecipes: (searchTerm: string) => Promise<void>
  refreshRecipes: () => Promise<void>
  clearError: () => void
  clearSearch: () => void
}

// Recipe reducer actions
type RecipeAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SEARCH_RESULTS'; payload: Recipe[] }
  | { type: 'CLEAR_SEARCH' }

// Recipe reducer state
interface RecipeState {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  searchResults: Recipe[]
}

// Recipe reducer
const recipeReducer = (state: RecipeState, action: RecipeAction): RecipeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload, loading: false }
    case 'ADD_RECIPE':
      return { 
        ...state, 
        recipes: [action.payload, ...state.recipes]
      }
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((recipe: Recipe) =>
          recipe.id === action.payload.id ? action.payload : recipe
        )
      }
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter((recipe: Recipe) => recipe.id !== action.payload)
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, loading: false }
    case 'CLEAR_SEARCH':
      return { ...state, searchResults: [] }
    default:
      return state
  }
}

// Initial state
const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
  searchResults: []
}

// Create context
const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

// Recipe provider component
export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState)
  const { firebaseUser } = useAuth()

  // Load user recipes when user changes
  useEffect(() => {
    if (firebaseUser) {
      refreshRecipes()
    }
  }, [firebaseUser])

  // Add new recipe
  const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Validate recipe data
      if (!recipeData.title?.trim()) {
        throw new Error('Recipe title is required')
      }
      if (!recipeData.ingredients?.length) {
        throw new Error('At least one ingredient is required')
      }
      if (!recipeData.instructions?.length) {
        throw new Error('Cooking instructions are required')
      }

      // Create recipe with user ID
      const recipeWithUser = {
        ...recipeData,
        authorId: firebaseUser.uid
      }

      // Create recipe
      const recipeId = await recipeService.createRecipe(recipeWithUser)

      // Create full recipe object
      const newRecipe: Recipe = {
        id: recipeId,
        ...recipeWithUser,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      dispatch({ type: 'ADD_RECIPE', payload: newRecipe })

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Update recipe
  const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      // Validate updates
      if (updates.title && !updates.title.trim()) {
        throw new Error('Recipe title cannot be empty')
      }
      if (updates.ingredients && !updates.ingredients.length) {
        throw new Error('At least one ingredient is required')
      }
      if (updates.instructions && !updates.instructions.length) {
        throw new Error('Cooking instructions cannot be empty')
      }

      await recipeService.updateRecipe(id, updates)

      // Find and update recipe in local state
      const existingRecipe = state.recipes.find((recipe: Recipe) => recipe.id === id)
      if (existingRecipe) {
        const updatedRecipe: Recipe = {
          ...existingRecipe,
          ...updates,
          updatedAt: new Date()
        }
        dispatch({ type: 'UPDATE_RECIPE', payload: updatedRecipe })
      }

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // Delete recipe
  const deleteRecipe = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      await recipeService.deleteRecipe(id)
      dispatch({ type: 'DELETE_RECIPE', payload: id })

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // Search recipes
  const searchRecipes = async (searchTerm: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      if (!searchTerm.trim()) {
        dispatch({ type: 'CLEAR_SEARCH' })
        return
      }

      // Use the searchRecipes function from recipeService
      const results = await recipeService.searchRecipes({ searchTerm })
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results })

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Refresh user's recipes
  const refreshRecipes = async (): Promise<void> => {
    if (!firebaseUser) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const userRecipes = await recipeService.getRecipesByUserId(firebaseUser.uid)
      dispatch({ type: 'SET_RECIPES', payload: userRecipes })

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Clear search results
  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }

  // Context value
  const value: RecipeContextType = {
    ...state,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    refreshRecipes,
    clearError,
    clearSearch
  }

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  )
}

// Custom hook to use recipe context
export const useRecipes = () => {
  const context = useContext(RecipeContext)
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider')
  }
  return context
}