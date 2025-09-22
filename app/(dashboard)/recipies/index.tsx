import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { recipeService } from "@/services/recipeService";
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { RecipeCategory, DifficultyLevel, Ingredient } from "@/types/recipe";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

const RecipeFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { firebaseUser } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RecipeCategory>(RecipeCategory.BREAKFAST);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY);
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  // Load existing recipe if editing
  useEffect(() => {
    const loadRecipe = async () => {
      if (!isNew && id) {
        try {
          showLoader(LOADING_MESSAGES.FETCHING_RECIPES);
          const recipe = await recipeService.getRecipeById(id);
          if (recipe) {
            setTitle(recipe.title);
            setDescription(recipe.description);
            setCategory(recipe.category);
            setDifficulty(recipe.difficulty);
            setCookingTime(recipe.cookingTime.toString());
            setServings(recipe.servings.toString());
            setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", quantity: "", unit: "" }]);
            setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [""]);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load recipe");
          router.back();
        } finally {
          hideLoader();
        }
      }
    };
    loadRecipe();
  }, [id, isNew]);

  // Ingredient handlers
  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Instruction handlers
  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!title.trim()) return Alert.alert("Validation Error", "Recipe title is required"), false;
    if (!description.trim()) return Alert.alert("Validation Error", "Recipe description is required"), false;
    if (!cookingTime || isNaN(Number(cookingTime)) || Number(cookingTime) <= 0)
      return Alert.alert("Validation Error", "Please enter a valid cooking time"), false;
    if (!servings || isNaN(Number(servings)) || Number(servings) <= 0)
      return Alert.alert("Validation Error", "Please enter valid number of servings"), false;
    if (ingredients.filter(ing => ing.name.trim() && ing.quantity.trim()).length === 0)
      return Alert.alert("Validation Error", "At least one ingredient is required"), false;
    if (instructions.filter(inst => inst.trim()).length === 0)
      return Alert.alert("Validation Error", "At least one instruction step is required"), false;
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!firebaseUser) return Alert.alert("Error", "You must be logged in to save recipes");

    try {
      showLoader(isNew ? LOADING_MESSAGES.SAVING_RECIPE : "Updating recipe...");

      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
      const validInstructions = instructions.filter(inst => inst.trim());

      const recipeData = {
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
      };

      if (isNew) {
        await recipeService.createRecipe(recipeData);
        Alert.alert("Success", "Recipe created successfully!", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        await recipeService.updateRecipe(id, recipeData);
        Alert.alert("Success", "Recipe updated successfully!", [{ text: "OK", onPress: () => router.back() }]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save recipe");
    } finally {
      hideLoader();
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">{isNew ? "Add Recipe" : "Edit Recipe"}</Text>
          </View>

          {/* Basic Info */}
          <View className="mb-6">
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
              placeholder="Recipe Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Picker selectedValue={category} onValueChange={setCategory} style={{ height: 50 }}>
                  <Picker.Item label="Breakfast" value={RecipeCategory.BREAKFAST} />
                  <Picker.Item label="Lunch" value={RecipeCategory.LUNCH} />
                  <Picker.Item label="Dinner" value={RecipeCategory.DINNER} />
                  <Picker.Item label="Dessert" value={RecipeCategory.DESSERT} />
                  <Picker.Item label="Snack" value={RecipeCategory.SNACK} />
                  <Picker.Item label="Beverage" value={RecipeCategory.BEVERAGE} />
                </Picker>
              </View>
              <View className="flex-1 ml-2">
                <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={{ height: 50 }}>
                  <Picker.Item label="Easy" value={DifficultyLevel.EASY} />
                  <Picker.Item label="Medium" value={DifficultyLevel.MEDIUM} />
                  <Picker.Item label="Hard" value={DifficultyLevel.HARD} />
                </Picker>
              </View>
            </View>
            <View className="flex-row mb-4">
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-1 mr-2"
                placeholder="Cooking Time (min)"
                value={cookingTime}
                onChangeText={setCookingTime}
                keyboardType="numeric"
              />
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-1 ml-2"
                placeholder="Servings"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            {ingredients.map((ing, i) => (
              <View key={i} className="flex-row mb-2">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 mr-2"
                  placeholder="Name"
                  value={ing.name}
                  onChangeText={v => updateIngredient(i, 'name', v)}
                />
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-20 mr-2"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChangeText={v => updateIngredient(i, 'quantity', v)}
                />
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-16 mr-2"
                  placeholder="Unit"
                  value={ing.unit}
                  onChangeText={v => updateIngredient(i, 'unit', v)}
                />
                <TouchableOpacity onPress={() => removeIngredient(i)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addIngredient} className="bg-orange-500 px-4 py-2 rounded-lg mt-2">
              <Text className="text-white font-medium">Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className="mb-6">
            {instructions.map((inst, i) => (
              <View key={i} className="flex-row mb-2 items-start">
                <Text className="mr-2 mt-2">{i + 1}.</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1"
                  placeholder={`Step ${i + 1}`}
                  value={inst}
                  onChangeText={v => updateInstruction(i, v)}
                  multiline
                />
                <TouchableOpacity onPress={() => removeInstruction(i)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addInstruction} className="bg-orange-500 px-4 py-2 rounded-lg mt-2">
              <Text className="text-white font-medium">Add Step</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-orange-500 py-4 rounded-xl mb-8"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isNew ? "Create Recipe" : "Update Recipe"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RecipeFormScreen;
