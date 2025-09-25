
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
  TextInput
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
  const [allRecentRecipes, setAllRecentRecipes] = useState<Recipe[]>([])
  const [allPopularRecipes, setAllPopularRecipes] = useState<Recipe[]>([])
  const [allUserRecipes, setAllUserRecipes] = useState<Recipe[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null)
  const [showMyRecipesOnly, setShowMyRecipesOnly] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchBar, setShowSearchBar] = useState(false)

  const quickActions = [
    {
      title: "Add Recipe",
      icon: "add-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#FF6B35",
      route: "/(dashboard)/recipies/new"
    },
    {
      title: "My Recipes",
      icon: "restaurant-outline" as keyof typeof Ionicons.glyphMap,
      color: "#8B5CF6",
      action: "myRecipes"
    },
    {
      title: "Favorites",
      icon: "heart-outline" as keyof typeof Ionicons.glyphMap,
      color: "#EF4444",
      action: "favorites"
    },
    {
      title: "Search",
      icon: "search-outline" as keyof typeof Ionicons.glyphMap,
      color: "#3B82F6",
      action: "search"
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
      setAllRecentRecipes(recent)
      
      setPopularRecipes(popular)
      setAllPopularRecipes(popular)
      
      const limitedUserRecipes = userRecs.slice(0, 4)
      setUserRecipes(limitedUserRecipes)
      setAllUserRecipes(limitedUserRecipes)
      
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
    setSelectedCategory(null)
    setShowMyRecipesOnly(false)
    setShowFavoritesOnly(false)
    setSearchQuery('')
    setShowSearchBar(false)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // Handle recipe press - navigate to recipe detail
  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/(dashboard)/recipies/view/${recipe.id}`)
  }

  // Handle edit recipe
  const handleEditRecipe = (recipe: Recipe) => {
    router.push(`/(dashboard)/recipies/${recipe.id}`)
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    const recipe = allRecentRecipes.find(r => r.id === recipeId) ||
                   allPopularRecipes.find(r => r.id === recipeId) ||
                   allUserRecipes.find(r => r.id === recipeId);

    if (!recipe) return;

    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              showLoader("Deleting recipe...");
              await recipeService.deleteRecipe(recipeId);

              setRecentRecipes(prev => prev.filter(r => r.id !== recipeId));
              setAllRecentRecipes(prev => prev.filter(r => r.id !== recipeId));
              setPopularRecipes(prev => prev.filter(r => r.id !== recipeId));
              setAllPopularRecipes(prev => prev.filter(r => r.id !== recipeId));
              setUserRecipes(prev => prev.filter(r => r.id !== recipeId));
              setAllUserRecipes(prev => prev.filter(r => r.id !== recipeId));

              Alert.alert("Success", "Recipe deleted successfully");
            } catch (error: any) {
              const message = error?.message || JSON.stringify(error) || "Failed to delete recipe";
              Alert.alert("Error", message);
            } finally {
              hideLoader();
            }
          }
        }
      ]
    );
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    try {
      await recipeService.toggleFavorite(recipeId, isFavorite)
      // Update local state
      const updateRecipes = (recipes: Recipe[]) => 
        recipes.map(r => r.id === recipeId ? { ...r, isFavorite } : r)
      
      setRecentRecipes(updateRecipes)
      setAllRecentRecipes(updateRecipes)
      setPopularRecipes(updateRecipes)
      setAllPopularRecipes(updateRecipes)
      setUserRecipes(updateRecipes)
      setAllUserRecipes(updateRecipes)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update favorite")
    }
  }

  // Handle category press
  const handleCategoryPress = (category: RecipeCategory) => {
    if (category === selectedCategory) {
      setSelectedCategory(null);
      applyFilters();
    } else {
      setSelectedCategory(category);
      applyFilters(category, showMyRecipesOnly, showFavoritesOnly, searchQuery);
    }
  };

  // Handle My Recipes action
  const handleMyRecipesPress = () => {
    setShowMyRecipesOnly(!showMyRecipesOnly);
    setShowFavoritesOnly(false); // Reset favorites when showing my recipes
    applyFilters(selectedCategory, !showMyRecipesOnly, false, searchQuery);
  };

  // Handle Favorites action
  const handleFavoritesPress = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setShowMyRecipesOnly(false); // Reset my recipes when showing favorites
    applyFilters(selectedCategory, false, !showFavoritesOnly, searchQuery);
  };

  // Handle Search action
  const handleSearchPress = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      setSearchQuery('');
      applyFilters(selectedCategory, showMyRecipesOnly, showFavoritesOnly, '');
    }
  };

  // Apply all filters
  const applyFilters = (
    category?: RecipeCategory | null, 
    myRecipesOnly?: boolean, 
    favoritesOnly?: boolean,
    query?: string
  ) => {
    const currentCategory = category !== undefined ? category : selectedCategory;
    const currentMyRecipesOnly = myRecipesOnly !== undefined ? myRecipesOnly : showMyRecipesOnly;
    const currentFavoritesOnly = favoritesOnly !== undefined ? favoritesOnly : showFavoritesOnly;
    const currentQuery = query !== undefined ? query : searchQuery;

    let filteredRecent = [...allRecentRecipes];
    let filteredPopular = [...allPopularRecipes];
    let filteredUser = [...allUserRecipes];

    // Apply category filter
    if (currentCategory) {
      filteredRecent = filteredRecent.filter(recipe => recipe.category === currentCategory);
      filteredPopular = filteredPopular.filter(recipe => recipe.category === currentCategory);
      filteredUser = filteredUser.filter(recipe => recipe.category === currentCategory);
    }

    // Apply search filter
    if (currentQuery.trim()) {
      const lowerCaseQuery = currentQuery.toLowerCase();
      const searchFilter = (recipe: Recipe) =>
        recipe.title.toLowerCase().includes(lowerCaseQuery) ||
        (recipe.description && recipe.description.toLowerCase().includes(lowerCaseQuery));

      filteredRecent = filteredRecent.filter(searchFilter);
      filteredPopular = filteredPopular.filter(searchFilter);
      filteredUser = filteredUser.filter(searchFilter);
    }

    // Apply Favorites filter
    if (currentFavoritesOnly) {
      filteredRecent = filteredRecent.filter(recipe => recipe.isFavorite);
      filteredPopular = filteredPopular.filter(recipe => recipe.isFavorite);
      filteredUser = filteredUser.filter(recipe => recipe.isFavorite);
    }

    // Apply My Recipes filter
    if (currentMyRecipesOnly) {
      filteredRecent = [];
      filteredPopular = [];
      // Keep only user recipes
    } else {
    }

    setRecentRecipes(filteredRecent);
    setPopularRecipes(filteredPopular);
    setUserRecipes(filteredUser);
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    applyFilters(selectedCategory, showMyRecipesOnly, showFavoritesOnly, text);
  };

  // Handle quick action press
  const handleQuickActionPress = (action: any) => {
    if (action.route) {
      router.push(action.route as any);
    } else if (action.action === 'myRecipes') {
      handleMyRecipesPress();
    } else if (action.action === 'favorites') {
      handleFavoritesPress();
    } else if (action.action === 'search') {
      handleSearchPress();
    }
  };

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

      {/* Search Bar */}
      {showSearchBar && (
        <View className="mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-3 text-gray-700"
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Status indicators */}
      {(showMyRecipesOnly || showFavoritesOnly || selectedCategory || searchQuery) && (
        <View className="flex-row flex-wrap mb-4 gap-2">
          {showMyRecipesOnly && (
            <View className="bg-purple-100 px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-purple-700 text-sm font-medium">My Recipes</Text>
              <TouchableOpacity onPress={handleMyRecipesPress} className="ml-2">
                <Ionicons name="close" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          )}
          {showFavoritesOnly && (
            <View className="bg-red-100 px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-red-700 text-sm font-medium">Favorites</Text>
              <TouchableOpacity onPress={handleFavoritesPress} className="ml-2">
                <Ionicons name="close" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
          {selectedCategory && (
            <View className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-orange-700 text-sm font-medium">
                {categories.find(c => c.category === selectedCategory)?.name}
              </Text>
              <TouchableOpacity onPress={() => handleCategoryPress(selectedCategory)} className="ml-2">
                <Ionicons name="close" size={16} color="#EA580C" />
              </TouchableOpacity>
            </View>
          )}
          {searchQuery && (
            <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-blue-700 text-sm font-medium">"{searchQuery}"</Text>
              <TouchableOpacity onPress={() => handleSearchChange('')} className="ml-2">
                <Ionicons name="close" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View className="flex-row justify-between">
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleQuickActionPress(action)}
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
              className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
                selectedCategory === category.category ? 'opacity-100' : 'opacity-70'
              }`}
              style={{ 
                backgroundColor: selectedCategory === category.category 
                  ? category.color 
                  : `${category.color}20` 
              }}
            >
              <Ionicons 
                name={category.icon as any} 
                size={28} 
                color={selectedCategory === category.category ? 'white' : category.color} 
              />
            </View>
            <Text className={`text-sm font-medium text-center ${
              selectedCategory === category.category ? 'text-gray-900' : 'text-gray-700'
            }`}>
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

  // Render horizontal recipe list with actions
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
            onEdit={firebaseUser?.uid === item.authorId ? handleEditRecipe : undefined}
            onDelete={firebaseUser?.uid === item.authorId ? handleDeleteRecipe : undefined}
            onToggleFavorite={handleToggleFavorite}
            variant="featured"
            showActions={false}
          />
        </View>
      )}
      keyExtractor={(item) => item.id!}
    />
  )

  // Render user recipes grid with actions
  const renderUserRecipesGrid = () => (
    <View className="px-4">
      <View className="flex-row flex-wrap justify-end">
        {userRecipes.map((recipe) => (
          <View key={recipe.id} style={{ width: (width - 48) / 2 }}>
            <RecipeCard
              recipe={recipe}
              onPress={handleRecipePress}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
              onToggleFavorite={handleToggleFavorite}
              variant="default"
              showActions={true}
            />
          </View>
        ))}
      </View>
    </View>
  )

  // Render favorites grid
  const renderFavoritesGrid = () => {
    // Combine all recipes and remove duplicates by ID
    const allRecipes = [...recentRecipes, ...popularRecipes, ...userRecipes];
    const uniqueFavoriteRecipes = allRecipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );

    return (
      <View className="px-4">
        <View className="flex-row flex-wrap justify-between">
          {uniqueFavoriteRecipes.map((recipe) => (
            <View key={`fav-${recipe.id}`} style={{ width: (width - 48) / 2, marginBottom: 16 }}>
              <RecipeCard
                recipe={recipe}
                onPress={handleRecipePress}
                onEdit={firebaseUser?.uid === recipe.authorId ? handleEditRecipe : undefined}
                onDelete={firebaseUser?.uid === recipe.authorId ? handleDeleteRecipe : undefined}
                onToggleFavorite={handleToggleFavorite}
                variant="default"
                showActions={firebaseUser?.uid === recipe.authorId}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Render empty state
  const renderEmptyState = () => (
    <View className="items-center py-20 px-8">
      <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4">
        <Ionicons 
          name={showFavoritesOnly ? "heart-outline" : "restaurant-outline"} 
          size={48} 
          color="#FF6B35" 
        />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {showMyRecipesOnly 
          ? "No My Recipes Found" 
          : showFavoritesOnly 
            ? "No Favorite Recipes" 
            : "Welcome to FoodieFlow!"
        }
      </Text>
      <Text className="text-gray-600 text-center mb-6 leading-6">
        {showMyRecipesOnly 
          ? "You haven't added any recipes matching the current filters." 
          : showFavoritesOnly
            ? "You haven't marked any recipes as favorites yet. Tap the heart icon on recipes to save them here."
            : "Start your culinary journey by adding your first recipe or exploring recipes from other chefs."
        }
      </Text>
      {!showFavoritesOnly && (
        <TouchableOpacity
          onPress={() => router.push("/(dashboard)/recipies/new")}
          className="bg-orange-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Add Your First Recipe</Text>
        </TouchableOpacity>
      )}
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
          {!showMyRecipesOnly && !showFavoritesOnly && renderCategories()}
          
          {/* Recent Recipes */}
          {!showMyRecipesOnly && !showFavoritesOnly && recentRecipes.length > 0 && (
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
          {!showMyRecipesOnly && !showFavoritesOnly && popularRecipes.length > 0 && (
            <View className="mb-6">
              {renderSectionHeader(
                "Popular This Week", 
                "Highly rated recipes",
                () => router.push("/(dashboard)/recipies")
              )}
              {renderHorizontalRecipeList(popularRecipes)}
            </View>
          )}

          {/* Favorite Recipes */}
          {showFavoritesOnly && (recentRecipes.length > 0 || popularRecipes.length > 0 || userRecipes.length > 0) && (
            <View className="mb-8">
              {renderSectionHeader(
                "Favorite Recipes", 
                "Your saved favorite recipes",
                () => router.push("/(dashboard)/recipies")
              )}
              {renderFavoritesGrid()}
            </View>
          )}

          {/* User's Recipes */}
          {userRecipes.length > 0 && !showFavoritesOnly && (
            <View className="mb-8">
              {renderSectionHeader(
                showMyRecipesOnly ? "My Recipes" : "Your Recipes", 
                showMyRecipesOnly ? "All your culinary creations" : "Your culinary creations",
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