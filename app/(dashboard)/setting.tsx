import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/services/authService"
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext"

const SettingScreen = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()

  const settingItems = [
    {
      title: "Edit Profile",
      subtitle: "Update your profile information",
      icon: "person-outline",
      onPress: () => router.push("/(dashboard)/edit-profile")
    },
    {
      title: "Change Password",
      subtitle: "Update your account password", 
      icon: "key-outline",
      onPress: () => router.push("/(dashboard)/change-password")
    },
    {
      title: "About",
      subtitle: "Recipe App Version 1.0.0",
      icon: "information-circle-outline",
      onPress: () => Alert.alert("About", "Recipe App v1.0.0\nYour cooking companion")
    },
    {
      title: "Sign Out",
      subtitle: "Sign out of your account",
      icon: "log-out-outline",
      onPress: () => handleSignOut(),
      isDestructive: true
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
            } catch (error) {
              Alert.alert("Error", "Failed to sign out")
            } finally {
              hideLoader()
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6">
        <View className="px-4">
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
        </View>
      </View>

      {/* Settings Items */}
      <View className="px-4 py-6">
        <View className="bg-white rounded-xl overflow-hidden">
          {settingItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className={`
                px-4 py-4 flex-row items-center justify-between
                ${index < settingItems.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <View className="flex-row items-center flex-1">
                <View className={`
                  w-10 h-10 rounded-lg items-center justify-center mr-3
                  ${item.isDestructive ? 'bg-red-100' : 'bg-gray-100'}
                `}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.isDestructive ? "#EF4444" : "#6B7280"} 
                  />
                </View>
                <View className="flex-1">
                  <Text className={`
                    font-semibold mb-1
                    ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}
                  `}>
                    {item.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default SettingScreen