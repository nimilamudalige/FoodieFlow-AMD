import { auth } from "@/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react"
import { User as AppUser, UserProfile } from "@/types/user"
import { userService } from "@/services/userService"

type AuthContextType = { 
  firebaseUser: User | null
  user: AppUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
  updateUserProfile: async () => {}
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchUserData = async (firebaseUser: User) => {
    try {
      const userData = await userService.getUser(firebaseUser.uid)
      if (userData) {
        setUser(userData)
      } else {
        // Create new user profile if doesn't exist
        const newUser: Omit<AppUser, 'id'> = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          profileImage: firebaseUser.photoURL || undefined,
          favoriteRecipes: [],
          preferences: {
            dietaryRestrictions: [],
            favoriteCategories: [],
            skillLevel: 'beginner',
            cookingStyle: [],
            measurementUnit: 'metric'
          },
          createdAt: new Date()
        }
        const createdUser = await userService.createUser(firebaseUser.uid, newUser)
        setUser(createdUser)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser)
    }
  }

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (firebaseUser && user) {
      try {
        const updatedUser = await userService.updateUser(firebaseUser.uid, {
          ...profileData,
          updatedAt: new Date()
        })
        setUser(updatedUser)
      } catch (error) {
        console.error('Error updating user profile:', error)
        throw error
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        await fetchUserData(firebaseUser)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ 
      firebaseUser, 
      user, 
      loading, 
      refreshUser, 
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}