export interface Recipe {
  id?: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  category: RecipeCategory
  cookingTime: number // in minutes
  servings: number
  difficulty: DifficultyLevel
  imageUrl?: string
  rating?: number // 1-5 stars
  isFavorite?: boolean
  createdAt?: Date
  updatedAt?: Date
  authorId?: string
}

export interface Ingredient {
  id?: string
  name: string
  quantity: string
  unit: string
}

export enum RecipeCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  DESSERT = 'dessert',
  SNACK = 'snack',
  BEVERAGE = 'beverage'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface RecipeFilter {
  category?: RecipeCategory
  difficulty?: DifficultyLevel
  maxCookingTime?: number
  searchTerm?: string
  showFavoritesOnly?: boolean
}