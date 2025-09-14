export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  bio?: string
  favoriteRecipes?: string[] // Recipe IDs
  preferences: UserPreferences
  createdAt: Date
  updatedAt?: Date
}

export interface UserPreferences {
  dietaryRestrictions: DietaryRestriction[]
  favoriteCategories: string[] // Recipe categories
  skillLevel: 'beginner' | 'intermediate' | 'expert'
  cookingStyle: CookingStyle[]
  measurementUnit: 'metric' | 'imperial'
}

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  KETO = 'keto',
  LOW_CARB = 'low_carb',
  HALAL = 'halal'
}

export enum CookingStyle {
  QUICK_MEALS = 'quick_meals',
  HEALTHY = 'healthy',
  COMFORT_FOOD = 'comfort_food',
  GOURMET = 'gourmet',
  BUDGET_FRIENDLY = 'budget_friendly',
  MEAL_PREP = 'meal_prep'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface UserProfile {
  name: string
  bio?: string
  profileImage?: string
  preferences: UserPreferences
}