// app/(dashboard)/recipes/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useRecipes } from '../../../context/RecipeContext';
import { RecipeCard } from '../../../components/RecipeCard';
import { Recipe } from '../../../types/recipe';
import { RECIPE_CATEGORIES } from '../../../types/recipe';

interface RecipesIndexProps {
  navigation: any;
}

const RecipesIndex: React.FC<RecipesIndexProps> = ({ navigation }) => {
  const { userProfile, isAdmin } = useAuth();
  const { 
    recipes, 
    loading, 
    refreshUserRecipes, 
    deleteRecipe,
    searchRecipes 
  } = useRecipes();

  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, selectedCategory]);

  const loadRecipes = async () => {
    try {
      await refreshUserRecipes();
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRecipes(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecipes();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigation.navigate('EditRecipe', { recipeId: recipe.id });
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    try {
      await deleteRecipe(recipe.id);
      Alert.alert('Success', 'Recipe deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const getStatusBadge = (recipe: Recipe) => {
    if (!recipe.isApproved) {
      return { text: 'Pending', color: '#FF9800' };
    } else if (!recipe.isPublic) {
      return { text: 'Private', color: '#757575' };
    } else {
      return { text: 'Published', color: '#4CAF50' };
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeItemContainer}>
      <RecipeCard
        recipe={item}
        onPress={() => handleRecipePress(item)}
        onEdit={() => handleEditRecipe(item)}
        onDelete={() => handleDeleteRecipe(item)}
        showActions={true}
        showLike={false}
      />
    </View>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipSelected
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item && styles.categoryChipTextSelected
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{recipes.length}</Text>
          <Text style={styles.statLabel}>Total Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {recipes.filter(r => r.isApproved).length}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {recipes.filter(r => !r.isApproved).length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your recipes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
          {(searchTerm || selectedCategory) && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={RECIPE_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {searchTerm || selectedCategory ? 'Search Results' : 'Your Recipes'}
        </Text>
        <Text style={styles.resultsCount}>
          {filteredRecipes.length} recipes
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {searchTerm || selectedCategory ? 'No recipes found' : 'No recipes yet'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchTerm || selectedCategory
          ? 'Try adjusting your search or filters'
          : 'Start by creating your first recipe!'
        }
      </Text>
      {searchTerm || selectedCategory ? (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addFirstRecipeButton} onPress={handleAddRecipe}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.addFirstRecipeText}>Add Your First Recipe</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddRecipe}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  categoriesSection: {
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B6B',
  }
  ,  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  recipeItemContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF6B6B',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  clearFiltersButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  clearFiltersText: {
    color: '#333',
    fontSize: 16,
  },
  addFirstRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
  },
  addFirstRecipeText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default RecipesIndex;  