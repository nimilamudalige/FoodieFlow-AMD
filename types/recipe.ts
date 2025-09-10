export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  cookingTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  userId: string;
}

export interface RecipeContextType {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  searchRecipes: (searchTerm: string) => Promise<void>;
  refreshRecipes: () => Promise<void>;
}