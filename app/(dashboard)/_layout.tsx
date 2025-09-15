import { View, Text, SafeAreaView, ActivityIndicator } from "react-native"
import React, { useEffect } from "react"
import { Tabs, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"

const DashboardLayout = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  console.log("User Data:", user)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/(auth)/login")
    }
  }, [user, loading])

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View className="items-center">
          <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="restaurant" size={32} color="#FF6B35" />
          </View>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="text-gray-600 mt-2 font-medium">Loading Recipe App...</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FF6B35", // Orange theme for Recipe App
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingBottom: 6,
            paddingTop: 6,
            height: 60
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600"
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            )
          }}
        />
        
        <Tabs.Screen
          name="recipes"
          options={{
            title: "Recipes",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "restaurant" : "restaurant-outline"}
                size={size}
                color={color}
              />
            )
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            )
          }}
        />
        
        <Tabs.Screen
          name="setting"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={color}
              />
            )
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}

export default DashboardLayout