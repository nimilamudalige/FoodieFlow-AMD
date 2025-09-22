import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Recipe, RecipeCategory, DifficultyLevel } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'
import { useAuth } from '@/context/AuthContext'

const { width } = Dimensions.get('window')

const RecipeDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { firebaseUser } = useAuth()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const recipeData = await recipeService.getRecipeById(id)
      if (recipeData) {
        setRecipe(recipeData)
      } else {
        Alert.alert('Error', 'Recipe not found')
        router.back()
      }
    } catch {
      Alert.alert('Error', 'Failed to load recipe')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!recipe) return
    try {
      await recipeService.toggleFavorite(recipe.id!, !recipe.isFavorite)
      setRecipe({ ...recipe, isFavorite: !recipe.isFavorite })
    } catch {
      Alert.alert('Error', 'Failed to update favorite')
    }
  }

  const getCategoryIcon = (category: RecipeCategory) => {
    switch (category) {
      case RecipeCategory.BREAKFAST: return 'sunny-outline'
      case RecipeCategory.LUNCH: return 'restaurant-outline'
      case RecipeCategory.DINNER: return 'moon-outline'
      case RecipeCategory.DESSERT: return 'ice-cream-outline'
      case RecipeCategory.SNACK: return 'fast-food-outline'
      case RecipeCategory.BEVERAGE: return 'wine-outline'
      default: return 'restaurant-outline'
    }
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY: return '#4ADE80'
      case DifficultyLevel.MEDIUM: return '#FACC15'
      case DifficultyLevel.HARD: return '#F87171'
      default: return '#9CA3AF'
    }
  }

  const formatCookingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const renderStars = (rating: number = 0) => (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={20}
          color="#FACC15"
        />
      ))}
      <Text className="text-gray-600 text-base ml-2">
        ({rating.toFixed(1)})
      </Text>
    </View>
  )

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg">Loading recipe...</Text>
      </View>
    )
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg">Recipe not found</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* 🔶 Compact Orange Header */}
      <View className="bg-orange-500 pt-10 pb-4 px-4 h-25">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleFavorite}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons
              name={recipe.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
            <Ionicons
              name={getCategoryIcon(recipe.category)}
              size={32}
              color="white"
            />
          </View>

          {/* 🔹 Title shortened with ellipsis */}
          <Text
            className="text-white text-xl font-bold mb-1 text-center"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ maxWidth: width * 0.8 }}
          >
            {recipe.title}
          </Text>

          <Text
            className="text-white/90 text-sm mb-3 text-center"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ maxWidth: width * 0.85 }}
          >
            {recipe.description}
          </Text>

          {/* Quick Stats */}
          <View className="flex-row bg-white/20 rounded-xl p-3">
            <View className="items-center mr-6">
              <Ionicons name="time-outline" size={20} color="white" />
              <Text className="text-white font-semibold mt-1">
                {formatCookingTime(recipe.cookingTime)}
              </Text>
              <Text className="text-white/80 text-xs">Time</Text>
            </View>

            <View className="items-center mr-6">
              <Ionicons name="people-outline" size={20} color="white" />
              <Text className="text-white font-semibold mt-1">{recipe.servings}</Text>
              <Text className="text-white/80 text-xs">Servings</Text>
            </View>

            <View className="items-center">
              <View
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
              />
              <Text className="text-white font-semibold mt-1 capitalize">
                {recipe.difficulty}
              </Text>
              <Text className="text-white/80 text-xs">Difficulty</Text>
            </View>
          </View>

          {renderStars(recipe.rating)}
        </View>
      </View>

      {/* 📜 More visible details area */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ingredients */}
        <View className="p-6 border-b border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="list-outline" size={24} color="#FF6B35" />
            <Text className="text-xl font-bold text-gray-900 ml-3">
              Ingredients ({recipe.ingredients.length})
            </Text>
          </View>

          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-center py-3 border-b border-gray-50">
              <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Text className="text-orange-600 text-xs font-semibold">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 text-gray-900 text-base leading-6">
                <Text className="font-semibold">{ingredient.quantity} {ingredient.unit}</Text>{' '}
                {ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View className="p-6 border-b border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="clipboard-outline" size={24} color="#FF6B35" />
            <Text className="text-xl font-bold text-gray-900 ml-3">
              Instructions ({recipe.instructions.length} steps)
            </Text>
          </View>

          {recipe.instructions.map((instruction, index) => (
            <View key={index} className="flex-row mb-5">
              <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-4 mt-1">
                <Text className="text-white font-bold text-sm">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-base leading-6">
                  {instruction}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Meta Info */}
        <View className="p-6 border-b border-gray-100">
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name={getCategoryIcon(recipe.category)} size={20} color="#6B7280" />
                <Text className="text-gray-600 ml-2 capitalize">
                  {recipe.category}
                </Text>
              </View>

              {recipe.createdAt && (
                <Text className="text-gray-500 text-sm">
                  Created {new Date(recipe.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>

            {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
              <Text className="text-gray-500 text-sm">
                Updated {new Date(recipe.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default RecipeDetailScreen
