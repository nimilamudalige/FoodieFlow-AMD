import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { Recipe } from '../types/recipe';

export const recipeService = {
  // Create new recipe
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>, userId: string) {
    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recipe,
        userId,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create recipe');
    }
  },

  // Get user's recipes
  async getRecipes(userId: string) {
    try {
      const q = query(
        collection(db, 'recipes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
    } catch (error) {
      throw new Error('Failed to fetch recipes');
    }
  },

  // Update recipe
  async updateRecipe(recipeId: string, updates: Partial<Recipe>) {
    try {
      const docRef = doc(db, 'recipes', recipeId);
      await updateDoc(docRef, updates);
    } catch (error) {
      throw new Error('Failed to update recipe');
    }
  },

  // Delete recipe
  async deleteRecipe(recipeId: string) {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
    } catch (error) {
      throw new Error('Failed to delete recipe');
    }
  },

  // Search recipes by title
  async searchRecipes(searchTerm: string, userId: string) {
    try {
      const q = query(
        collection(db, 'recipes'),
        where('userId', '==', userId),
        orderBy('title')
      );
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      
      return recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      throw new Error('Failed to search recipes');
    }
  }
};