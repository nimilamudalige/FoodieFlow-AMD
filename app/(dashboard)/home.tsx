import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Image,
  Dimensions
} from "react-native"
import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"
import { recipeService } from "@/services/recipeService"
import { Recipe, RecipeCategory } from "@/types/recipe"
import RecipeCard from "@/components/RecipeCard"
import { useLoader } from "@/context/LoaderContext"

const { width } = Dimensions.get('window')

const HomeScreen = () => {
  const router = useRouter()
  const { user, firebaseUser } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([])
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const quickActions = [
    {
      title: "Add Recipe",
      icon: "add-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#FF6B35",
      route: "/(dashboard)/recipes/new"
    },
    {
      title: "My Recipes",
      icon: "restaurant-outline" as keyof typeof Ionicons.glyphMap,
      color: "#8B5CF6",
      route: "/(dashboard)/recipes"
    },
    {
      title: "Favorites",
      icon: "heart-outline" as keyof typeof Ionicons.glyphMap,
      color: "#EF4444",
      route: "/(dashboard)/favorites"
    },
    {
      title: "Search",
      icon: "search-outline" as keyof typeof Ionicons.glyphMap,
      color: "#3B82F6",
      route: "/(dashboard)/search"
    }
  ]

  const categories = [
    { name: "Breakfast", icon: "sunny-outline", category: RecipeCategory.BREAKFAST, color: "#F59E0B" },
    { name: "Lunch", icon: "restaurant-outline", category: RecipeCategory.LUNCH, color: "#10B981" },
    { name: "Dinner", icon: "moon-outline", category: RecipeCategory.DINNER, color: "#8B5CF6" },
    { name: "Desserts", icon: "ice-cream-outline", category: RecipeCategory.DESSERT, color: "#F472B6" }
  ]

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [recent, popular, userRecs] = await Promise.all([
        recipeService.getRecentRecipes(6),
        recipeService.getPopularRecipes(4),
        firebaseUser ? recipeService.getRecipesByUserId(firebaseUser.uid) : Promise.resolve([])
      ])
      
      setRecentRecipes(recent)
      setPopularRecipes(popular)
      setUserRecipes(userRecs.slice(0, 4)) // Show only first 4
    } catch (error) {
      console.error('Error loading home data:', error)
    }
  }, [firebaseUser])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // Handle recipe press
  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/(dashboard)/recipies/view/${recipe.id}`)
  }

  // Handle category press
  const handleCategoryPress = (category: RecipeCategory) => {
    router.push({
      pathname: "/(dashboard)/recipies",
      params: { category }
    })
  }

  // Render header
  const renderHeader = () => (
    <View className="px-4 pt-12 pb-6 bg-white">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Hello, {user?.name?.split(' ')[0] || 'Chef'}!
          </Text>
          <Text className="text-gray-600 mt-1">
            What would you like to cook today?
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(dashboard)/profile")}>
          <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <Ionicons name="person" size={24} color="#FF6B35" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="flex-row justify-between">
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(action.route as any)}
            className="items-center"
          >
            <View 
              className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text className="text-xs font-medium text-gray-700 text-center">
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  // Render categories
  const renderCategories = () => (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Browse Categories</Text>
      <View className="flex-row justify-between">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCategoryPress(category.category)}
            className="items-center"
          >
            <View 
              className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <Ionicons name={category.icon as any} size={28} color={category.color} />
            </View>
            <Text className="text-sm font-medium text-gray-700 text-center">
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  // Render section header
  const renderSectionHeader = (title: string, subtitle: string, onSeeAll?: () => void) => (
    <View className="flex-row items-center justify-between px-4 mb-4">
      <View>
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-600">{subtitle}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-orange-600 font-medium">See All</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  // Render horizontal recipe list
  const renderHorizontalRecipeList = (recipes: Recipe[]) => (
    <FlatList
      data={recipes}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View className="w-4" />}
      renderItem={({ item }) => (
        <View style={{ width: width * 0.7 }}>
          <RecipeCard
            recipe={item}
            onPress={handleRecipePress}
            variant="featured"
            showActions={false}
          />
        </View>
      )}
      keyExtractor={(item) => item.id!}
    />
  )

  // Render user recipes grid
  const renderUserRecipesGrid = () => (
    <View className="px-4">
      <View className="flex-row flex-wrap justify-between">
        {userRecipes.map((recipe) => (
          <View key={recipe.id} style={{ width: (width - 48) / 2 }}>
            <RecipeCard
              recipe={recipe}
              onPress={handleRecipePress}
              variant="compact"
              showActions={false}
            />
          </View>
        ))}
      </View>
    </View>
  )

  // Render empty state
  const renderEmptyState = () => (
    <View className="items-center py-20 px-8">
      <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="restaurant-outline" size={48} color="#FF6B35" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Welcome to Recipe App!
      </Text>
      <Text className="text-gray-600 text-center mb-6 leading-6">
        Start your culinary journey by adding your first recipe or exploring recipes from other chefs.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(dashboard)/recipies/new")}
        className="bg-orange-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Add Your First Recipe</Text>
      </TouchableOpacity>
    </View>
  )

  const hasContent = recentRecipes.length > 0 || popularRecipes.length > 0 || userRecipes.length > 0

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#FF6B35']}
          tintColor="#FF6B35"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      
      {hasContent ? (
        <>
          {renderCategories()}
          
          {/* Recent Recipes */}
          {recentRecipes.length > 0 && (
            <View className="mb-6">
              {renderSectionHeader(
                "Recent Recipes", 
                "Latest recipes from the community",
                () => router.push("/(dashboard)/recipies")
              )}
              {renderHorizontalRecipeList(recentRecipes)}
            </View>
          )}

          {/* Popular Recipes */}
          {popularRecipes.length > 0 && (
            <View className="mb-6">
              {renderSectionHeader(
                "Popular This Week", 
                "Highly rated recipes",
                () => router.push("/(dashboard)/recipies")
              )}
              {renderHorizontalRecipeList(popularRecipes)}
            </View>
          )}

          {/* User's Recipes */}
          {userRecipes.length > 0 && (
            <View className="mb-8">
              {renderSectionHeader(
                "Your Recipes", 
                "Your culinary creations",
                () => router.push("/(dashboard)/recipies")
              )}
              {renderUserRecipesGrid()}
            </View>
          )}
        </>
      ) : (
        renderEmptyState()
      )}
    </ScrollView>
  )
}

export default HomeScreen