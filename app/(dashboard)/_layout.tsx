import { Stack } from "expo-router"
import React from "react"

const RecipesLayout = () => {
  return (
    <Stack 
      screenOptions={{ 
        animation: "slide_from_right",
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#374151',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      
      <Stack.Screen
        name="[id]"
        options={{
          title: "Recipe Form",
          headerShown: false,
          href: null // Hide from tab navigation
        }}
      />
      
      <Stack.Screen
        name="view/[id]"
        options={{
          title: "Recipe Details",
          headerShown: false,
          href: null // Hide from tab navigation
        }}
      />
      
      <Stack.Screen
        name="new"
        options={{
          title: "Add Recipe",
          headerShown: false,
          href: null // Hide from tab navigation
        }}
      />
      
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Edit Recipe",
          headerShown: false,
          href: null // Hide from tab navigation
        }}
      />
    </Stack>
  )
}

export default RecipesLayout