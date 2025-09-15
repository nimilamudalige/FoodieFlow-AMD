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
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore"
import { Recipe, RecipeCategory, DifficultyLevel, RecipeFilter } from "@/types/recipe"
import { db } from "@/firebase"

// Collection reference
export const recipeColRef = collection(db, "recipes")
const RECIPES_PER_PAGE = 10

export const recipeService = {
  // ==================== CRUD Operations ====================
  
  // Create new recipe
  createRecipe: async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const recipeData = {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        isFavorite: false
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

  // ==================== Query Operations ====================

  // Get all recipes with pagination
  getAllRecipes: async (lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{
    recipes: Recipe[]
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
    hasMore: boolean
  }> => {
    try {
      let q = query(
        recipeColRef,
        orderBy('createdAt', 'desc'),
        limit(RECIPES_PER_PAGE)
      )

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const snapshot = await getDocs(q)
      const recipes = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      })

      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null
      const hasMore = snapshot.docs.length === RECIPES_PER_PAGE

      return { recipes, lastDoc: lastVisible, hasMore }
    } catch (error) {
      console.error('Error getting all recipes:', error)
      throw new Error('Failed to get recipes')
    }
  },

  // Get recipes by user ID
  getRecipesByUserId: async (userId: string): Promise<Recipe[]> => {
    try {
      const q = query(
        recipeColRef, 
        where("authorId", "==", userId),
        orderBy('createdAt', 'desc')
      )
      
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
      
      return recipes
    } catch (error) {
      console.error('Error getting user recipes:', error)
      throw new Error('Failed to get user recipes')
    }
  },

  // Get recipes by category
  getRecipesByCategory: async (category: RecipeCategory): Promise<Recipe[]> => {
    try {
      const q = query(
        recipeColRef,
        where("category", "==", category),
        orderBy('createdAt', 'desc')
      )
      
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
      
      return recipes
    } catch (error) {
      console.error('Error getting recipes by category:', error)
      throw new Error('Failed to get recipes by category')
    }
  },

  // Search and filter recipes
  searchRecipes: async (filters: RecipeFilter): Promise<Recipe[]> => {
    try {
      let q = query(recipeColRef)

      // Add filters
      if (filters.category) {
        q = query(q, where("category", "==", filters.category))
      }

      if (filters.difficulty) {
        q = query(q, where("difficulty", "==", filters.difficulty))
      }

      if (filters.maxCookingTime) {
        q = query(q, where("cookingTime", "<=", filters.maxCookingTime))
      }

      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      let recipes = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Recipe
      })

      // Client-side filtering for search term and favorites
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

  // ==================== Rating & Favorites ====================

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

  // Get favorite recipes
  getFavoriteRecipes: async (userId: string): Promise<Recipe[]> => {
    try {
      const q = query(
        recipeColRef,
        where("authorId", "==", userId),
        where("isFavorite", "==", true),
        orderBy('updatedAt', 'desc')
      )
      
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
      
      return recipes
    } catch (error) {
      console.error('Error getting favorite recipes:', error)
      throw new Error('Failed to get favorite recipes')
    }
  },

  // ==================== Statistics ====================

  // Get recipe count by user
  getRecipeCountByUser: async (userId: string): Promise<number> => {
    try {
      const q = query(recipeColRef, where("authorId", "==", userId))
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      console.error('Error getting recipe count:', error)
      return 0
    }
  },

  // Get popular recipes (high rated)
  getPopularRecipes: async (limitCount: number = 10): Promise<Recipe[]> => {
    try {
      const q = query(
        recipeColRef,
        where("rating", ">=", 4),
        orderBy('rating', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
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
      
      return recipes
    } catch (error) {
      console.error('Error getting popular recipes:', error)
      return []
    }
  },

  // Get recent recipes
  getRecentRecipes: async (limitCount: number = 10): Promise<Recipe[]> => {
    try {
      const q = query(
        recipeColRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
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
      
      return recipes
    } catch (error) {
      console.error('Error getting recent recipes:', error)
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
