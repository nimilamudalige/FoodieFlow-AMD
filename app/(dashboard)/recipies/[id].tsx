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
import * as ImagePicker from 'expo-image-picker'

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
  const [imageUri, setImageUri] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" }
  ])
  const [instructions, setInstructions] = useState<string[]>([""]) 

  // Debug form state
  console.log("=== FORM STATE DEBUG ===")
  console.log("Current form values:", {
    title,
    description,
    category,
    difficulty,
    cookingTime,
    servings,
    imageUri,
    ingredientsCount: ingredients.length,
    instructionsCount: instructions.length,
    firebaseUser: firebaseUser?.uid
  })

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select images!')
        }
      }
    })()
  }, [])

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
            setImageUri(recipe.imageUrl || "")
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

  // Image picker function
  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (event: any) => {
          const file = event.target.files[0]
          if (file) {
            // Create a data URL for preview
            const reader = new FileReader()
            reader.onload = (e) => {
              setImageUri(e.target?.result as string)
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      } else {
        // Mobile implementation
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            { text: 'Camera', onPress: openCamera },
            { text: 'Gallery', onPress: openGallery },
            { text: 'Cancel', style: 'cancel' }
          ]
        )
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera')
    }
  }

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery')
    }
  }

  // Remove image
  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setImageUri('') }
      ]
    )
  }

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

  // Form validation with debug
  const validateForm = (): boolean => {
    console.log("=== FORM VALIDATION ===")
    console.log("Title:", title)
    console.log("Description:", description)
    console.log("Cooking time:", cookingTime)
    console.log("Servings:", servings)
    
    if (!title.trim()) {
      console.log("❌ Validation failed: Title required")
      Alert.alert("Validation Error", "Recipe title is required")
      return false
    }

    if (!description.trim()) {
      console.log("❌ Validation failed: Description required")
      Alert.alert("Validation Error", "Recipe description is required")
      return false
    }

    if (!cookingTime || isNaN(Number(cookingTime)) || Number(cookingTime) <= 0) {
      console.log("❌ Validation failed: Invalid cooking time")
      Alert.alert("Validation Error", "Please enter a valid cooking time")
      return false
    }

    if (!servings || isNaN(Number(servings)) || Number(servings) <= 0) {
      console.log("❌ Validation failed: Invalid servings")
      Alert.alert("Validation Error", "Please enter valid number of servings")
      return false
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim())
    console.log("Valid ingredients:", validIngredients)
    if (validIngredients.length === 0) {
      console.log("❌ Validation failed: No valid ingredients")
      Alert.alert("Validation Error", "At least one ingredient is required")
      return false
    }

    const validInstructions = instructions.filter(inst => inst.trim())
    console.log("Valid instructions:", validInstructions)
    if (validInstructions.length === 0) {
      console.log("❌ Validation failed: No valid instructions")
      Alert.alert("Validation Error", "At least one instruction step is required")
      return false
    }

    console.log("✅ Form validation passed")
    return true
  }

  // Handle form submission with comprehensive debug
  const handleSubmit = async () => {
    console.log("=== RECIPE SUBMIT STARTED ===")
    console.log("🟡 Button clicked!")
    alert("Button clicked! Check console for details.")
    
    console.log("Form data:", { 
      title, 
      description, 
      category, 
      difficulty, 
      cookingTime, 
      servings,
      imageUri,
      ingredientsCount: ingredients.length,
      instructionsCount: instructions.length
    })
    
    console.log("Firebase User:", {
      exists: !!firebaseUser,
      uid: firebaseUser?.uid,
      email: firebaseUser?.email
    })
    
    console.log("Ingredients:", ingredients)
    console.log("Instructions:", instructions)

    if (!validateForm()) {
      console.log("❌ Form validation failed - stopping submission")
      return
    }

    if (!firebaseUser) {
      console.log("❌ No firebase user found")
      Alert.alert("Error", "You must be logged in to save recipes")
      return
    }

    console.log("✅ Starting recipe save process...")
    
    try {
      showLoader(isNew ? LOADING_MESSAGES.SAVING_RECIPE : "Updating recipe...")
      console.log("🔄 Loader shown")

      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim())
      const validInstructions = instructions.filter(inst => inst.trim())

      console.log("✅ Filtered data:")
      console.log("Valid ingredients:", validIngredients)
      console.log("Valid instructions:", validInstructions)

      // Prepare recipe data
      const recipeData: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        cookingTime: Number(cookingTime),
        servings: Number(servings),
        ingredients: validIngredients,
        instructions: validInstructions,
        authorId: firebaseUser.uid,
        rating: 0,
        isFavorite: false
      }

      // Add image URL if present
      if (imageUri && imageUri.trim()) {
        recipeData.imageUrl = imageUri.trim()
        console.log("✅ Image URL added:", imageUri)
      }

      console.log("✅ Final recipe data:", recipeData)

      if (isNew) {
        console.log("🔄 Creating new recipe...")
        const result = await recipeService.createRecipe(recipeData)
        console.log("✅ Recipe created successfully with ID:", result)
        
        Alert.alert("Success", "Recipe created successfully!", [
          { text: "OK", onPress: () => {
            console.log("✅ Navigating back...")
            router.back()
          }}
        ])
      } else {
        console.log("🔄 Updating existing recipe...")
        await recipeService.updateRecipe(id, recipeData)
        console.log("✅ Recipe updated successfully")
        
        Alert.alert("Success", "Recipe updated successfully!", [
          { text: "OK", onPress: () => {
            console.log("✅ Navigating back...")
            router.back()
          }}
        ])
      }
    } catch (error: any) {
      console.error("❌ Recipe save error:", error)
      console.error("❌ Error message:", error.message)
      console.error("❌ Error code:", error.code)
      console.error("❌ Full error:", error)
      Alert.alert("Error", `Failed to save recipe: ${error.message || 'Unknown error'}`)
    } finally {
      console.log("🔄 Hiding loader...")
      hideLoader()
      console.log("=== RECIPE SUBMIT ENDED ===")
    }
  }

  // Test button function
  const testButtonClick = () => {
    alert("Test button works!")
    console.log("Test button clicked successfully")
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

          {/* Debug Info */}
          <View className="mb-4 p-3 bg-gray-100 rounded">
            <Text className="text-sm font-bold">DEBUG INFO:</Text>
            <Text className="text-xs">User: {firebaseUser?.email || 'Not logged in'}</Text>
            <Text className="text-xs">Title: {title || 'Empty'}</Text>
            <Text className="text-xs">Description: {description || 'Empty'}</Text>
            <Text className="text-xs">Ingredients: {ingredients.length}</Text>
            <Text className="text-xs">Instructions: {instructions.length}</Text>
          </View>

          {/* Test Button */}
          <TouchableOpacity
            onPress={testButtonClick}
            className="bg-green-500 p-3 rounded mb-4"
          >
            <Text className="text-white text-center font-bold">TEST BUTTON</Text>
          </TouchableOpacity>

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

            {/* Enhanced Image Picker */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Recipe Image</Text>
              
              {imageUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="absolute top-2 right-2 flex-row space-x-2">
                    <TouchableOpacity
                      onPress={handlePickImage}
                      className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center"
                    >
                      <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      className="bg-red-500 w-10 h-10 rounded-full items-center justify-center"
                    >
                      <Ionicons name="trash" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="border-2 border-dashed border-gray-300 rounded-xl h-48 items-center justify-center bg-gray-50"
                >
                  <View className="items-center">
                    <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
                      <Ionicons name="camera" size={32} color="#FF6B35" />
                    </View>
                    <Text className="text-gray-600 font-medium mb-1">Add Recipe Photo</Text>
                    <Text className="text-gray-500 text-sm text-center px-8">
                      Tap to select an image from gallery or take a photo
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
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
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isNew ? "CREATE RECIPE (DEBUG)" : "UPDATE RECIPE (DEBUG)"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RecipeFormScreen