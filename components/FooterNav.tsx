import { View, Text, Pressable } from "react-native"
import React from "react"
import { useRouter, useSegments } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

interface NavItem {
  name: string
  route: string
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
  label: string
}

const FooterNav = () => {
  const router = useRouter()
  const segments = useSegments()
  const activeRoute = "/" + (segments[0] || "")

  const navItems: NavItem[] = [
    {
      name: "home",
      route: "/",
      icon: "home-outline",
      activeIcon: "home",
      label: "Home"
    },
    {
      name: "search",
      route: "/search",
      icon: "search-outline", 
      activeIcon: "search",
      label: "Search"
    },
    {
      name: "add",
      route: "/add-recipe",
      icon: "add-circle-outline",
      activeIcon: "add-circle",
      label: "Add Recipe"
    },
    {
      name: "favorites", 
      route: "/favorites",
      icon: "heart-outline",
      activeIcon: "heart",
      label: "Favorites"
    },
    {
      name: "profile",
      route: "/profile", 
      icon: "person-outline",
      activeIcon: "person",
      label: "Profile"
    }
  ]

  const isActiveRoute = (route: string) => {
    if (route === "/") {
      return activeRoute === "/" || activeRoute === ""
    }
    return activeRoute.startsWith(route)
  }

  const handleNavigation = (route: string) => {
    router.push(route as any)
  }

  return (
    <View className="bg-white border-t border-gray-200 shadow-lg">
      <View className="flex-row justify-around items-center py-2 pb-6">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.route)
          
          return (
            <Pressable
              key={item.name}
              onPress={() => handleNavigation(item.route)}
              className={`
                flex-1 items-center justify-center py-2 mx-1 rounded-xl
                ${isActive ? 'bg-orange-50' : 'bg-transparent'}
              `}
              android_ripple={{ 
                color: '#FED7CC', 
                borderless: true,
                radius: 35
              }}
            >
              {/* Special styling for Add Recipe button */}
              {item.name === 'add' ? (
                <View className={`
                  items-center justify-center w-12 h-12 rounded-full
                  ${isActive ? 'bg-orange-500' : 'bg-orange-400'}
                  shadow-lg mb-1
                `}>
                  <Ionicons
                    name={isActive ? item.activeIcon : item.icon}
                    size={28}
                    color="white"
                  />
                </View>
              ) : (
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? '#FF6B35' : '#6B7280'}
                  className="mb-1"
                />
              )}
              
              <Text className={`
                text-xs font-medium
                ${isActive ? 'text-orange-600' : 'text-gray-500'}
                ${item.name === 'add' ? 'text-orange-600' : ''}
              `}>
                {item.label}
              </Text>
              
              {/* Active indicator dot */}
              {isActive && item.name !== 'add' && (
                <View className="w-1 h-1 bg-orange-500 rounded-full mt-1" />
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default FooterNav