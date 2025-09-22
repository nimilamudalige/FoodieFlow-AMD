import { AuthProvider } from "@/context/AuthContext"
import { LoaderProvider } from "@/context/LoaderContext"
import { RecipeProvider } from "@/context/RecipeContext"
import { Slot } from "expo-router"
import React from "react"
import "./../global.css"

const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <RecipeProvider>
          <Slot />
        </RecipeProvider>
      </AuthProvider>
    </LoaderProvider>
  )
}

export default RootLayout