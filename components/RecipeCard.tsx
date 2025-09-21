// import React from "react"
// import { 
//   View, 
//   Text, 
//   Image, 
//   TouchableOpacity, 
//   Alert,
//   Dimensions 
// } from "react-native"
// import { Recipe, RecipeCategory, DifficultyLevel } from "@/types/recipe"
// import { Ionicons } from "@expo/vector-icons"

// interface RecipeCardProps {
//   recipe: Recipe
//   onPress?: (recipe: Recipe) => void
//   onEdit?: (recipe: Recipe) => void
//   onDelete?: (recipeId: string) => void
//   onToggleFavorite?: (recipeId: string, isFavorite: boolean) => void
//   showActions?: boolean
//   variant?: 'default' | 'compact' | 'featured'
// }

// const { width } = Dimensions.get('window')
// const cardWidth = (width - 48) / 2 // For 2 columns with padding

// const RecipeCard: React.FC<RecipeCardProps> = ({
//   recipe,
//   onPress,
//   onEdit,
//   onDelete,
//   onToggleFavorite,
//   showActions = true,
//   variant = 'default'
// }) => {

//   const getCategoryIcon = (category: RecipeCategory) => {
//     switch (category) {
//       case RecipeCategory.BREAKFAST: return 'sunny-outline'
//       case RecipeCategory.LUNCH: return 'restaurant-outline'
//       case RecipeCategory.DINNER: return 'moon-outline'
//       case RecipeCategory.DESSERT: return 'ice-cream-outline'
//       case RecipeCategory.SNACK: return 'fast-food-outline'
//       case RecipeCategory.BEVERAGE: return 'wine-outline'
//       default: return 'restaurant-outline'
//     }
//   }

//   const getDifficultyColor = (difficulty: DifficultyLevel) => {
//     switch (difficulty) {
//       case DifficultyLevel.EASY: return '#4ADE80'
//       case DifficultyLevel.MEDIUM: return '#FACC15'
//       case DifficultyLevel.HARD: return '#F87171'
//       default: return '#9CA3AF'
//     }
//   }

//   const formatCookingTime = (minutes: number) => {
//     if (minutes < 60) return `${minutes}m`
//     const hours = Math.floor(minutes / 60)
//     const remainingMinutes = minutes % 60
//     return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
//   }

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Recipe",
//       `Are you sure you want to delete "${recipe.title}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Delete", 
//           style: "destructive",
//           onPress: () => onDelete?.(recipe.id!)
//         }
//       ]
//     )
//   }

//   const handleFavoriteToggle = () => {
//     onToggleFavorite?.(recipe.id!, !recipe.isFavorite)
//   }

//   const renderStars = (rating: number = 0) => {
//     return (
//       <View className="flex-row items-center">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Ionicons
//             key={star}
//             name={star <= rating ? "star" : "star-outline"}
//             size={14}
//             color="#FACC15"
//           />
//         ))}
//         <Text className="text-gray-600 text-xs ml-1">
//           ({rating.toFixed(1)})
//         </Text>
//       </View>
//     )
//   }

//   // Compact variant for lists
//   if (variant === 'compact') {
//     return (
//       <TouchableOpacity
//         onPress={() => onPress?.(recipe)}
//         className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
//       >
//         <View className="flex-row">
//           <Image
//             source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/80x80' }}
//             className="w-16 h-16 rounded-lg"
//           />
//           <View className="flex-1 ml-3">
//             <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={1}>
//               {recipe.title}
//             </Text>
//             <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
//               {recipe.description}
//             </Text>
//             <View className="flex-row items-center justify-between">
//               <View className="flex-row items-center">
//                 <Ionicons name="time-outline" size={14} color="#6B7280" />
//                 <Text className="text-gray-600 text-xs ml-1">
//                   {formatCookingTime(recipe.cookingTime)}
//                 </Text>
//               </View>
//               {renderStars(recipe.rating)}
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     )
//   }

//   // Featured variant for highlights
//   if (variant === 'featured') {
//     return (
//       <TouchableOpacity
//         onPress={() => onPress?.(recipe)}
//         className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden"
//         style={{ width: width - 32 }}
//       >
//         <Image
//           source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400x200' }}
//           className="w-full h-48"
//         />
//         <View className="p-4">
//           <View className="flex-row items-center justify-between mb-2">
//             <View className="flex-row items-center">
//               <Ionicons name={getCategoryIcon(recipe.category)} size={18} color="#FF6B6B" />
//               <Text className="text-gray-600 text-sm ml-1 capitalize">
//                 {recipe.category}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={handleFavoriteToggle}>
//               <Ionicons
//                 name={recipe.isFavorite ? "heart" : "heart-outline"}
//                 size={24}
//                 color={recipe.isFavorite ? "#FF6B6B" : "#9CA3AF"}
//               />
//             </TouchableOpacity>
//           </View>
          
//           <Text className="font-bold text-xl text-gray-900 mb-2">
//             {recipe.title}
//           </Text>
//           <Text className="text-gray-600 text-base mb-3" numberOfLines={2}>
//             {recipe.description}
//           </Text>
          
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center space-x-4">
//               <View className="flex-row items-center">
//                 <Ionicons name="time-outline" size={16} color="#6B7280" />
//                 <Text className="text-gray-600 text-sm ml-1">
//                   {formatCookingTime(recipe.cookingTime)}
//                 </Text>
//               </View>
              
//               <View className="flex-row items-center">
//                 <View 
//                   className="w-3 h-3 rounded-full mr-1"
//                   style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
//                 />
//                 <Text className="text-gray-600 text-sm capitalize">
//                   {recipe.difficulty}
//                 </Text>
//               </View>
//             </View>
            
//             {renderStars(recipe.rating)}
//           </View>
//         </View>
//       </TouchableOpacity>
//     )
//   }

//   // Default card variant
//   return (
//     <TouchableOpacity
//       onPress={() => onPress?.(recipe)}
//       className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
//       style={{ width: cardWidth }}
//     >
//       {/* Recipe Image */}
//       <View className="relative">
//         <Image
//           source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/200x120' }}
//           className="w-full h-32"
//         />
        
//         {/* Category Badge */}
//         <View className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1">
//           <View className="flex-row items-center">
//             <Ionicons name={getCategoryIcon(recipe.category)} size={12} color="#FF6B6B" />
//             <Text className="text-xs font-medium text-gray-700 ml-1 capitalize">
//               {recipe.category}
//             </Text>
//           </View>
//         </View>

//         {/* Favorite Button */}
//         <TouchableOpacity
//           onPress={handleFavoriteToggle}
//           className="absolute top-2 right-2 bg-white/90 rounded-full p-1"
//         >
//           <Ionicons
//             name={recipe.isFavorite ? "heart" : "heart-outline"}
//             size={16}
//             color={recipe.isFavorite ? "#FF6B6B" : "#9CA3AF"}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Recipe Details */}
//       <View className="p-3">
//         <Text className="font-semibold text-gray-900 text-sm mb-1" numberOfLines={1}>
//           {recipe.title}
//         </Text>
//         <Text className="text-gray-600 text-xs mb-2" numberOfLines={2}>
//           {recipe.description}
//         </Text>

//         {/* Recipe Metadata */}
//         <View className="flex-row items-center justify-between mb-2">
//           <View className="flex-row items-center">
//             <Ionicons name="time-outline" size={12} color="#6B7280" />
//             <Text className="text-gray-600 text-xs ml-1">
//               {formatCookingTime(recipe.cookingTime)}
//             </Text>
//           </View>

//           <View className="flex-row items-center">
//             <View 
//               className="w-2 h-2 rounded-full mr-1"
//               style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
//             />
//             <Text className="text-gray-600 text-xs capitalize">
//               {recipe.difficulty}
//             </Text>
//           </View>
//         </View>

//         {/* Rating */}
//         {renderStars(recipe.rating)}

//         {/* Action Buttons */}
//         {showActions && (
//           <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-100">
//             <TouchableOpacity
//               onPress={() => onEdit?.(recipe)}
//               className="flex-row items-center px-3 py-1 bg-blue-50 rounded-lg"
//             >
//               <Ionicons name="create-outline" size={14} color="#3B82F6" />
//               <Text className="text-blue-600 text-xs font-medium ml-1">Edit</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleDelete}
//               className="flex-row items-center px-3 py-1 bg-red-50 rounded-lg"
//             >
//               <Ionicons name="trash-outline" size={14} color="#EF4444" />
//               <Text className="text-red-600 text-xs font-medium ml-1">Delete</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </TouchableOpacity>
//   )
// }

// export default RecipeCard

import React from "react"
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from "react-native"
import { Recipe, RecipeCategory, DifficultyLevel } from "@/types/recipe"
import { Ionicons } from "@expo/vector-icons"

interface RecipeCardProps {
  recipe: Recipe
  onPress?: (recipe: Recipe) => void
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipeId: string) => void
  onToggleFavorite?: (recipeId: string, isFavorite: boolean) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

const { width } = Dimensions.get('window')
const cardWidth = (width - 48) / 2 // For 2 columns with padding

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = true,
  variant = 'default'
}) => {

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

  const handleDelete = () => {
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => onDelete?.(recipe.id!)
          
        }
      ]
    )
    
  }

  const handleFavoriteToggle = () => {
    onToggleFavorite?.(recipe.id!, !recipe.isFavorite)
  }

  const renderStars = (rating: number = 0) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color="#FACC15"
          />
        ))}
        <Text className="text-gray-600 text-xs ml-1">
          ({rating.toFixed(1)})
        </Text>
      </View>
    )
  }

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(recipe)}
        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-orange-100 rounded-lg items-center justify-center mr-3">
            <Ionicons name={getCategoryIcon(recipe.category)} size={24} color="#FF6B35" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={1}>
              {recipe.title}
            </Text>
            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
              {recipe.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {formatCookingTime(recipe.cookingTime)}
                </Text>
              </View>
              {renderStars(recipe.rating)}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Featured variant for highlights
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(recipe)}
        className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden"
        style={{ width: width - 32 }}
      >
        {/* Header with Category Icon */}
        <View className="bg-orange-50 p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name={getCategoryIcon(recipe.category)} size={24} color="#FF6B35" />
              <Text className="text-orange-600 text-sm ml-2 font-medium capitalize">
                {recipe.category}
              </Text>
            </View>
            <TouchableOpacity onPress={handleFavoriteToggle}>
              <Ionicons
                name={recipe.isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={recipe.isFavorite ? "#FF6B35" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="p-4">
          <Text className="font-bold text-xl text-gray-900 mb-2">
            {recipe.title}
          </Text>
          <Text className="text-gray-600 text-base mb-3" numberOfLines={3}>
            {recipe.description}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {formatCookingTime(recipe.cookingTime)}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                />
                <Text className="text-gray-600 text-sm capitalize">
                  {recipe.difficulty}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {recipe.servings}
                </Text>
              </View>
            </View>
            
            {renderStars(recipe.rating)}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Default card variant
  return (
    <TouchableOpacity
      onPress={() => onPress?.(recipe)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
      style={{ width: cardWidth }}
    >
      {/* Header Section with Category */}
      <View className="relative bg-orange-50 p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name={getCategoryIcon(recipe.category)} size={18} color="#FF6B35" />
            <Text className="text-xs font-medium text-orange-700 ml-1 capitalize">
              {recipe.category}
            </Text>
          </View>
          <TouchableOpacity onPress={handleFavoriteToggle}>
            <Ionicons
              name={recipe.isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={recipe.isFavorite ? "#FF6B35" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Details */}
      <View className="p-3">
        <Text className="font-semibold text-gray-900 text-sm mb-1" numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text className="text-gray-600 text-xs mb-3" numberOfLines={3}>
          {recipe.description}
        </Text>

        {/* Recipe Metadata */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="text-gray-600 text-xs ml-1">
              {formatCookingTime(recipe.cookingTime)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View 
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
            />
            <Text className="text-gray-600 text-xs capitalize">
              {recipe.difficulty}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={12} color="#6B7280" />
            <Text className="text-gray-600 text-xs ml-1">
              {recipe.servings}
            </Text>
          </View>
        </View>

        {/* Rating */}
        {renderStars(recipe.rating)}

        {/* Action Buttons */}
        {showActions && (
          <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => onEdit?.(recipe)}
              className="flex-row items-center px-3 py-1 bg-blue-50 rounded-lg"
            >
              <Ionicons name="create-outline" size={14} color="#3B82F6" />
              <Text className="text-blue-600 text-xs font-medium ml-1">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center px-3 py-1 bg-red-50 rounded-lg"
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text className="text-red-600 text-xs font-medium ml-1">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default RecipeCard