import React, { createContext, useContext, useState, ReactNode } from "react"
import Loader from "@/components/Loader"

interface LoaderContextType {
  showLoader: (message?: string) => void
  hideLoader: () => void
  isLoading: boolean
  message: string
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("")

  const showLoader = (loadingMessage?: string) => {
    setMessage(loadingMessage || "Loading...")
    setVisible(true)
  }

  const hideLoader = () => {
    setVisible(false)
    setMessage("")
  }

  return (
    <LoaderContext.Provider 
      value={{ 
        showLoader, 
        hideLoader, 
        isLoading: visible, 
        message 
      }}
    >
      {children}
      <Loader visible={visible} message={message} />
    </LoaderContext.Provider>
  )
}

export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error("useLoader must be used within LoaderProvider")
  }
  return context
}

// Recipe App specific loading messages
export const LOADING_MESSAGES = {
  FETCHING_RECIPES: "Loading recipes...",
  SAVING_RECIPE: "Saving recipe...",
  DELETING_RECIPE: "Deleting recipe...",
  UPLOADING_IMAGE: "Uploading image...",
  SIGNING_IN: "Signing in...",
  SIGNING_UP: "Creating account...",
  SIGNING_OUT: "Signing out...",
  UPDATING_PROFILE: "Updating profile...",
  SEARCHING_RECIPES: "Searching recipes...",
  LOADING_FAVORITES: "Loading favorites..."
} as const