import { auth } from "@/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  User,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from "firebase/auth"
import { LoginCredentials, RegisterData } from "@/types/user"

export const authService = {
  // Basic Authentication
  login: async (credentials: LoginCredentials) => {
    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      return result
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  register: async (data: RegisterData) => {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match")
      }
      
      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const result = await createUserWithEmailAndPassword(auth, data.email, data.password)
      
      // Update profile with display name
      if (result.user) {
        await updateProfile(result.user, {
          displayName: data.name
        })
      }
      
      return result
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  logout: async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error("Failed to sign out")
    }
  },

  // Profile Management
  updateUserProfile: async (user: User, data: { name?: string; photoURL?: string }) => {
    try {
      await updateProfile(user, {
        displayName: data.name,
        photoURL: data.photoURL
      })
    } catch (error: any) {
      throw new Error("Failed to update profile")
    }
  },

  updateUserEmail: async (user: User, newEmail: string, currentPassword: string) => {
    try {
      // Reauthenticate before email update
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updateEmail(user, newEmail)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  updateUserPassword: async (user: User, currentPassword: string, newPassword: string) => {
    try {
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // Reauthenticate before password update
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  // Password Reset
  sendPasswordReset: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  // Account Deletion
  deleteAccount: async (user: User, password: string) => {
    try {
      // Reauthenticate before deletion
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)
      await deleteUser(user)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  },

  // Reauthentication
  reauthenticate: async (user: User, password: string) => {
    try {
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  }
}

// Helper function for user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password is too weak'
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue'
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    default:
      return 'An unexpected error occurred. Please try again'
  }
}

// Legacy exports for backward compatibility (if needed)
export const login = authService.login
export const logout = authService.logout  
export const register = authService.register