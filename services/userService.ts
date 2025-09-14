import { db } from "@/firebase"
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from "firebase/firestore"
import { User, UserPreferences, DietaryRestriction, CookingStyle } from "@/types/user"

const USERS_COLLECTION = "users"

export const userService = {
  // Create new user profile
  createUser: async (userId: string, userData: Omit<User, 'id'>): Promise<User> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      const newUser: User = {
        ...userData,
        id: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user profile')
    }
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data()
        return {
          ...userData,
          id: userSnap.id,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date()
        } as User
      }
      
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user profile')
    }
  },

  // Update user profile
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      // Get updated user data
      const updatedUser = await userService.getUser(userId)
      if (!updatedUser) {
        throw new Error('User not found after update')
      }
      
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user profile')
    }
  },

  // Update user preferences
  updatePreferences: async (userId: string, preferences: UserPreferences): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      
      await updateDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw new Error('Failed to update preferences')
    }
  },

  // Favorite recipes management
  addToFavorites: async (userId: string, recipeId: string): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      
      await updateDoc(userRef, {
        favoriteRecipes: arrayUnion(recipeId),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw new Error('Failed to add recipe to favorites')
    }
  },

  removeFromFavorites: async (userId: string, recipeId: string): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      
      await updateDoc(userRef, {
        favoriteRecipes: arrayRemove(recipeId),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw new Error('Failed to remove recipe from favorites')
    }
  },

  // Check if recipe is in favorites
  isRecipeFavorite: async (userId: string, recipeId: string): Promise<boolean> => {
    try {
      const user = await userService.getUser(userId)
      return user?.favoriteRecipes?.includes(recipeId) || false
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  },

  // Get user's favorite recipes
  getFavoriteRecipes: async (userId: string): Promise<string[]> => {
    try {
      const user = await userService.getUser(userId)
      return user?.favoriteRecipes || []
    } catch (error) {
      console.error('Error getting favorite recipes:', error)
      return []
    }
  },

  // Dietary restrictions management
  addDietaryRestriction: async (userId: string, restriction: DietaryRestriction): Promise<void> => {
    try {
      const user = await userService.getUser(userId)
      if (!user) throw new Error('User not found')

      const updatedRestrictions = [...(user.preferences.dietaryRestrictions || []), restriction]
      const uniqueRestrictions = [...new Set(updatedRestrictions)]

      await userService.updatePreferences(userId, {
        ...user.preferences,
        dietaryRestrictions: uniqueRestrictions
      })
    } catch (error) {
      console.error('Error adding dietary restriction:', error)
      throw new Error('Failed to add dietary restriction')
    }
  },

  removeDietaryRestriction: async (userId: string, restriction: DietaryRestriction): Promise<void> => {
    try {
      const user = await userService.getUser(userId)
      if (!user) throw new Error('User not found')

      const updatedRestrictions = user.preferences.dietaryRestrictions.filter(r => r !== restriction)

      await userService.updatePreferences(userId, {
        ...user.preferences,
        dietaryRestrictions: updatedRestrictions
      })
    } catch (error) {
      console.error('Error removing dietary restriction:', error)
      throw new Error('Failed to remove dietary restriction')
    }
  },

  // Search users (for future social features)
  searchUsers: async (searchTerm: string, limit: number = 10): Promise<User[]> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION)
      const q = query(
        usersRef, 
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      )
      
      const querySnapshot = await getDocs(q)
      const users: User[] = []
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        users.push({
          ...userData,
          id: doc.id,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date()
        } as User)
      })
      
      return users.slice(0, limit)
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Failed to search users')
    }
  },

  // Delete user profile
  deleteUser: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      await deleteDoc(userRef)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user profile')
    }
  },

  // Get user statistics (for profile page)
  getUserStats: async (userId: string): Promise<{
    totalRecipes: number
    favoriteCount: number
    accountAge: number // days
  }> => {
    try {
      const user = await userService.getUser(userId)
      if (!user) throw new Error('User not found')

      const accountAge = Math.floor(
        (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // You'll need to implement recipe counting in recipeService
      return {
        totalRecipes: 0, // Will be updated when recipeService is implemented
        favoriteCount: user.favoriteRecipes?.length || 0,
        accountAge
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return { totalRecipes: 0, favoriteCount: 0, accountAge: 0 }
    }
  }
}