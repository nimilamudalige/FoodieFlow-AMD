import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp
} from "firebase/firestore"
import { Recipe, RecipeCategory, DifficultyLevel, RecipeFilter } from "@/types/recipe"
import { db } from "@/firebase"

// Collection reference
export const recipeColRef = collection(db, "recipes")

export const recipeService = {
  // Create new recipe
  createRecipe: async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const recipeData = {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: recipe.rating || 0,
        isFavorite: recipe.isFavorite || false
      }
      
      const docRef = await addDoc(recipeColRef, recipeData)
      return docRef.id
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw new Error('Failed to create recipe')
    }
  },

  // Update existing recipe
  updateRecipe: async (id: string, recipe: Partial<Recipe>): Promise<void> => {
    try {
      const docRef = doc(db, "recipes", id)
      const { id: _id, createdAt, ...recipeData } = recipe
      
      await updateDoc(docRef, {
        ...recipeData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw new Error('Failed to update recipe')
    }
  },

  // Delete recipe
  deleteRecipe: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, "recipes", id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting recipe:', error)
      throw new Error('Failed to delete recipe')
    }
  },

  // Get single recipe by ID
  getRecipeById: async (id: string): Promise<Recipe | null> => {
    try {
      const recipeDocRef = doc(db, "recipes", id)
      const snapshot = await getDoc(recipeDocRef)
      
      if (snapshot.exists()) {
        const data = snapshot.data()
        return {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      }
      
      return null
    } catch (error) {
      console.error('Error getting recipe:', error)
      throw new Error('Failed to get recipe')
    }
  },

  // Get all recipes (simple query)
  getAllRecipes: async (): Promise<Recipe[]> => {
    try {
      const snapshot = await getDocs(recipeColRef)
      const recipes = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      })
      
      // Sort on client side to avoid index requirements
      return recipes.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0
        const dateB = b.createdAt?.getTime() || 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error getting all recipes:', error)
      throw new Error('Failed to get recipes')
    }
  },

  // Get recipes by user ID (simple query)
  getRecipesByUserId: async (userId: string): Promise<Recipe[]> => {
    try {
      const q = query(recipeColRef, where("authorId", "==", userId))
      const querySnapshot = await getDocs(q)
      
      const recipes = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      })
      
      // Sort on client side
      return recipes.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0
        const dateB = b.createdAt?.getTime() || 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error getting user recipes:', error)
      throw new Error('Failed to get user recipes')
    }
  },

  // Get recipes by category (simple query)
  getRecipesByCategory: async (category: RecipeCategory): Promise<Recipe[]> => {
    try {
      const q = query(recipeColRef, where("category", "==", category))
      const querySnapshot = await getDocs(q)
      
      const recipes = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      })
      
      // Sort on client side
      return recipes.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0
        const dateB = b.createdAt?.getTime() || 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error getting recipes by category:', error)
      throw new Error('Failed to get recipes by category')
    }
  },

  // Simple search (client-side filtering)
  searchRecipes: async (filters: RecipeFilter): Promise<Recipe[]> => {
    try {
      // Get all recipes first
      let recipes = await recipeService.getAllRecipes()

      // Apply filters on client side
      if (filters.category) {
        recipes = recipes.filter(recipe => recipe.category === filters.category)
      }

      if (filters.difficulty) {
        recipes = recipes.filter(recipe => recipe.difficulty === filters.difficulty)
      }

      if (filters.maxCookingTime) {
        recipes = recipes.filter(recipe => recipe.cookingTime <= filters.maxCookingTime!)
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        recipes = recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ingredient => 
            ingredient.name.toLowerCase().includes(searchLower)
          )
        )
      }

      if (filters.showFavoritesOnly) {
        recipes = recipes.filter(recipe => recipe.isFavorite)
      }

      return recipes
    } catch (error) {
      console.error('Error searching recipes:', error)
      throw new Error('Failed to search recipes')
    }
  },

  // Update recipe rating
  updateRating: async (recipeId: string, newRating: number): Promise<void> => {
    try {
      const docRef = doc(db, "recipes", recipeId)
      await updateDoc(docRef, {
        rating: newRating,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating rating:', error)
      throw new Error('Failed to update rating')
    }
  },

  // Toggle favorite status
  toggleFavorite: async (recipeId: string, isFavorite: boolean): Promise<void> => {
    try {
      const docRef = doc(db, "recipes", recipeId)
      await updateDoc(docRef, {
        isFavorite,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw new Error('Failed to update favorite status')
    }
  },

  // Get recent recipes (client-side sorting)
  getRecentRecipes: async (limitCount: number = 10): Promise<Recipe[]> => {
    try {
      const allRecipes = await recipeService.getAllRecipes()
      return allRecipes.slice(0, limitCount)
    } catch (error) {
      console.error('Error getting recent recipes:', error)
      return []
    }
  },

  // Get popular recipes (client-side filtering)
  getPopularRecipes: async (limitCount: number = 10): Promise<Recipe[]> => {
    try {
      const allRecipes = await recipeService.getAllRecipes()
      
      // Filter and sort by rating on client side
      const popularRecipes = allRecipes
        .filter(recipe => recipe.rating && recipe.rating >= 3)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limitCount)
      
      return popularRecipes
    } catch (error) {
      console.error('Error getting popular recipes:', error)
      return []
    }
  },

  // Get recipe count by user
  getRecipeCountByUser: async (userId: string): Promise<number> => {
    try {
      const recipes = await recipeService.getRecipesByUserId(userId)
      return recipes.length
    } catch (error) {
      console.error('Error getting recipe count:', error)
      return 0
    }
  },

  // Get favorite recipes
  getFavoriteRecipes: async (userId: string): Promise<Recipe[]> => {
    try {
      const userRecipes = await recipeService.getRecipesByUserId(userId)
      return userRecipes.filter(recipe => recipe.isFavorite)
    } catch (error) {
      console.error('Error getting favorite recipes:', error)
      return []
    }
  }
}

// Legacy exports for backward compatibility
export const createTask = recipeService.createRecipe
export const updateTask = recipeService.updateRecipe
export const deleteTask = recipeService.deleteRecipe
export const getAllTaskData = recipeService.getAllRecipes
export const getTaskById = recipeService.getRecipeById
export const getAllTaskByUserId = recipeService.getRecipesByUserId