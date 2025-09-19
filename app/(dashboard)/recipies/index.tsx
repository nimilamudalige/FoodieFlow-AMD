import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native"
import React, { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { recipeService } from "@/services/recipeService"
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext"
import { useAuth } from "@/context/AuthContext"
import { Recipe, RecipeCategory, DifficultyLevel, Ingredient } from "@/types/recipe"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from '@react-native-picker/picker'

const RecipeFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isNew = !id || id === "new"
  const router = useRouter()
  const { showLoader, hideLoader } = useLoader()
  const { firebaseUser } = useAuth()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<RecipeCategory>(RecipeCategory.BREAKFAST)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY)
  const [cookingTime, setCookingTime] = useState("")
  const [servings, setServings] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" }
  ])
  const [instructions, setInstructions] = useState<string[]>([""]) 

  // Load existing recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      if (!isNew && id) {
        try {
          showLoader(LOADING_MESSAGES.FETCHING_RECIPES)
          const recipe = await recipeService.getRecipeById(id)
          if (recipe) {
            setTitle(recipe.title)
            setDescription(recipe.description)
            setCategory(recipe.category)
            setDifficulty(recipe.difficulty)
            setCookingTime(recipe.cookingTime.toString())
            setServings(recipe.servings.toString())
            setImageUrl(recipe.imageUrl || "")
            setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", quantity: "", unit: "" }])
            setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [""])
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load recipe")
          router.back()
        } finally {
          hideLoader()
        }
      }
    }
    loadRecipe()
  }, [id, isNew])

  // Add ingredient
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])
  }

  // Remove ingredient
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index)
      setIngredients(newIngredients)
    }
  }

  // Update ingredient
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  // Add instruction step
  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  // Remove instruction step
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index)
      setInstructions(newInstructions)
    }
  }

  // Update instruction step
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const handlePickImage = async () => {
  if (Platform.OS === "web") {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (event: any) => {
      const file = event.target.files[0]
      if (file) {
        const url = URL.createObjectURL(file)
        setImageUrl(url)
      }
    }
    input.click()
  } else {
    Alert.alert("Image picker not implemented for mobile in this example.")
  }
}

  // Form validation
  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Recipe title is required")
      return false
    }

    if (!description.trim()) {
      Alert.alert("Validation Error", "Recipe description is required")
      return false
    }

    if (!cookingTime || isNaN(Number(cookingTime)) || Number(cookingTime) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid cooking time")
      return false
    }

    if (!servings || isNaN(Number(servings)) || Number(servings) <= 0) {
      Alert.alert("Validation Error", "Please enter valid number of servings")
      return false
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim())
    if (validIngredients.length === 0) {
      Alert.alert("Validation Error", "At least one ingredient is required")
      return false
    }

    const validInstructions = instructions.filter(inst => inst.trim())
    if (validInstructions.length === 0) {
      Alert.alert("Validation Error", "At least one instruction step is required")
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!firebaseUser) {
      Alert.alert("Error", "You must be logged in to save recipes")
      return
    }

    try {
      showLoader(isNew ? LOADING_MESSAGES.SAVING_RECIPE : "Updating recipe...")

      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim())
      const validInstructions = instructions.filter(inst => inst.trim())

      const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        cookingTime: Number(cookingTime),
        servings: Number(servings),
        imageUrl: imageUrl.trim() || undefined,
        ingredients: validIngredients,
        instructions: validInstructions,
        authorId: firebaseUser.uid,
        rating: 0,
        isFavorite: false
      }

      if (isNew) {
        await recipeService.createRecipe(recipeData)
        Alert.alert("Success", "Recipe created successfully!", [
          { text: "OK", onPress: () => router.back() }
        ])
      } else {
        await recipeService.updateRecipe(id, recipeData)
        Alert.alert("Success", "Recipe updated successfully!", [
          { text: "OK", onPress: () => router.back() }
        ])
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save recipe")
    } finally {
      hideLoader()
    }
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">
              {isNew ? "Add Recipe" : "Edit Recipe"}
            </Text>
          </View>

          {/* Basic Info */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Basic Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Recipe Title</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Enter recipe title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Brief description of your recipe"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
  <Text className="text-sm font-medium text-gray-700 mb-2">Recipe Image</Text>
  <TouchableOpacity
    className="bg-orange-500 px-4 py-2 rounded-lg mb-2"
    onPress={handlePickImage}
  >
    <Text className="text-white font-medium">Choose Image</Text>
  </TouchableOpacity>
  {imageUrl ? (
    <Image
      source={{ uri: imageUrl }}
      className="w-full h-32 rounded-xl mt-2"
      resizeMode="cover"
    />
  ) : null}
</View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl">
                  <Picker
                    selectedValue={category}
                    onValueChange={setCategory}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Breakfast" value={RecipeCategory.BREAKFAST} />
                    <Picker.Item label="Lunch" value={RecipeCategory.LUNCH} />
                    <Picker.Item label="Dinner" value={RecipeCategory.DINNER} />
                    <Picker.Item label="Dessert" value={RecipeCategory.DESSERT} />
                    <Picker.Item label="Snack" value={RecipeCategory.SNACK} />
                    <Picker.Item label="Beverage" value={RecipeCategory.BEVERAGE} />
                  </Picker>
                </View>
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">Difficulty</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl">
                  <Picker
                    selectedValue={difficulty}
                    onValueChange={setDifficulty}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Easy" value={DifficultyLevel.EASY} />
                    <Picker.Item label="Medium" value={DifficultyLevel.MEDIUM} />
                    <Picker.Item label="Hard" value={DifficultyLevel.HARD} />
                  </Picker>
                </View>
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">Cooking Time (minutes)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="30"
                  value={cookingTime}
                  onChangeText={setCookingTime}
                  keyboardType="numeric"
                />
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">Servings</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="4"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">Ingredients</Text>
              <TouchableOpacity
                onPress={addIngredient}
                className="bg-orange-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View key={index} className="flex-row mb-3">
                <View className="flex-1 mr-2">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChangeText={(value) => updateIngredient(index, 'name', value)}
                  />
                </View>
                <View className="w-20 mr-2">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    placeholder="Qty"
                    value={ingredient.quantity}
                    onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                  />
                </View>
                <View className="w-16 mr-2">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChangeText={(value) => updateIngredient(index, 'unit', value)}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeIngredient(index)}
                  className="w-8 h-8 items-center justify-center"
                  disabled={ingredients.length === 1}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={24} 
                    color={ingredients.length === 1 ? "#D1D5DB" : "#EF4444"} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">Instructions</Text>
              <TouchableOpacity
                onPress={addInstruction}
                className="bg-orange-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Add Step</Text>
              </TouchableOpacity>
            </View>

            {instructions.map((instruction, index) => (
              <View key={index} className="flex-row mb-3">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3 mt-2">
                  <Text className="text-orange-600 font-semibold text-sm">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm"
                    placeholder={`Step ${index + 1} instructions...`}
                    value={instruction}
                    onChangeText={(value) => updateInstruction(index, value)}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeInstruction(index)}
                  className="w-8 h-8 items-center justify-center ml-2 mt-2"
                  disabled={instructions.length === 1}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={24} 
                    color={instructions.length === 1 ? "#D1D5DB" : "#EF4444"} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-4 mb-8"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isNew ? "Create Recipe" : "Update Recipe"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RecipeFormScreen