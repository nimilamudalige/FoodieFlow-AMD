import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert
} from "react-native"
import React, { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/services/authService"
import { recipeService } from "@/services/recipeService"
import { userService } from "@/services/userService"
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext"

const ProfileScreen = () => {
  const router = useRouter()
  const { user, firebaseUser, refreshUser } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  
  const [userStats, setUserStats] = useState({
    totalRecipes: 0,
    favoriteCount: 0,
    accountAge: 0
  })

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      if (firebaseUser) {
        try {
          const [stats, recipeCount] = await Promise.all([
            userService.getUserStats(firebaseUser.uid),
            recipeService.getRecipeCountByUser(firebaseUser.uid)
          ])
          setUserStats({
            ...stats,
            totalRecipes: recipeCount
          })
        } catch (error) {
          console.error('Error loading user stats:', error)
        }
      }
    }
    loadStats()
  }, [firebaseUser])

  const profileOptions = [
    {
      title: "My Recipes",
      subtitle: `${userStats.totalRecipes} recipe${userStats.totalRecipes !== 1 ? 's' : ''}`,
      icon: "restaurant-outline",
      onPress: () => router.push("/(dashboard)/recipes")
    },
    {
      title: "Favorite Recipes", 
      subtitle: `${userStats.favoriteCount} favorite${userStats.favoriteCount !== 1 ? 's' : ''}`,
      icon: "heart-outline",
      onPress: () => router.push("/(dashboard)/favorites")
    },
    {
      title: "Dietary Preferences",
      subtitle: "Manage dietary restrictions",
      icon: "leaf-outline", 
      onPress: () => router.push("/(dashboard)/preferences")
    },
    {
      title: "Settings",
      subtitle: "App settings and preferences",
      icon: "settings-outline",
      onPress: () => router.push("/(dashboard)/settings")
    }
  ]

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            try {
              showLoader(LOADING_MESSAGES.SIGNING_OUT)
              await authService.logout()
              router.replace("/(auth)/login")
            } catch (error: any) {
              Alert.alert("Error", "Failed to sign out")
            } finally {
              hideLoader()
            }
          }
        }
      ]
    )
  }

  const handleEditProfile = () => {
    router.push("/(dashboard)/edit-profile")
  }

  const formatAccountAge = (days: number) => {
    if (days < 30) {
      return `${days} day${days !== 1 ? 's' : ''}`
    } else if (days < 365) {
      const months = Math.floor(days / 30)
      return `${months} month${months !== 1 ? 's' : ''}`
    } else {
      const years = Math.floor(days / 365)
      return `${years} year${years !== 1 ? 's' : ''}`
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6">
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View className="items-center">
            <View className="relative mb-4">
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center">
                  <Ionicons name="person" size={48} color="#FF6B35" />
                </View>
              )}
              <TouchableOpacity 
                onPress={handleEditProfile}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full items-center justify-center"
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-1">
              {user?.name || firebaseUser?.displayName || 'Chef'}
            </Text>
            <Text className="text-gray-600 mb-1">
              {user?.email || firebaseUser?.email}
            </Text>
            
            {user?.bio && (
              <Text className="text-gray-600 text-center mx-8 mb-4 leading-5">
                {user.bio}
              </Text>
            )}

            <Text className="text-sm text-gray-500">
              Member for {formatAccountAge(userStats.accountAge)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 py-6">
        <View className="flex-row">
          <View className="flex-1 bg-white rounded-xl p-4 mr-2 items-center">
            <Text className="text-2xl font-bold text-orange-500">
              {userStats.totalRecipes}
            </Text>
            <Text className="text-gray-600 text-sm">
              Recipe{userStats.totalRecipes !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View className="flex-1 bg-white rounded-xl p-4 ml-2 items-center">
            <Text className="text-2xl font-bold text-red-500">
              {userStats.favoriteCount}
            </Text>
            <Text className="text-gray-600 text-sm">
              Favorite{userStats.favoriteCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Options */}
      <View className="px-4 pb-6">
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={option.onPress}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name={option.icon as any} size={20} color="#6B7280" />
              </View>
              <View>
                <Text className="font-semibold text-gray-900 mb-1">
                  {option.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {option.subtitle}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="px-4 pb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
        
        <TouchableOpacity
          onPress={() => router.push("/(dashboard)/recipes/new")}
          className="bg-orange-500 rounded-xl p-4 mb-3 flex-row items-center justify-center"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-semibold ml-2 text-lg">
            Add New Recipe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View className="px-4 pb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>
        
        <TouchableOpacity
          onPress={() => router.push("/(dashboard)/change-password")}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="key-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="font-semibold text-gray-900">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white rounded-xl p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="font-semibold text-red-600">Sign Out</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ProfileScreen