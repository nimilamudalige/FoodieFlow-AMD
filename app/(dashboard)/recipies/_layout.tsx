import { View, Text } from "react-native"
import React from "react"
import { Stack } from "expo-router"

const RecipeLayout = () => {
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
          headerShown: false // We handle header in the component
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "Add Recipe",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="view/[id]"
        options={{
          title: "Recipe Details",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Edit Recipe",
          headerShown: false
        }}
      />
    </Stack>
  )
}

export default RecipeLayout