import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { authService } from "@/services/authService"
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext"
import { LoginCredentials } from "@/types/user"

const Login = () => {
  const router = useRouter()
  const { showLoader, hideLoader } = useLoader()
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    try {
      showLoader(LOADING_MESSAGES.SIGNING_IN)
      await authService.login(formData)
      router.replace("/(dashboard)/home")
    } catch (error: any) {
      Alert.alert(
        "Login Failed", 
        error.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      hideLoader()
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      Alert.alert("Email Required", "Please enter your email address first")
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address")
      return
    }

    Alert.alert(
      "Reset Password",
      "Send password reset email to " + formData.email + "?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send", 
          onPress: async () => {
            try {
              showLoader("Sending reset email...")
              await authService.sendPasswordReset(formData.email)
              Alert.alert("Email Sent", "Please check your email for password reset instructions")
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to send reset email")
            } finally {
              hideLoader()
            }
          }
        }
      ]
    )
  }

  const updateFormData = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          
          {/* Header Section */}
          <View className="items-center mb-12">
            {/* App Logo/Icon */}
            <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="restaurant" size={48} color="#FF6B35" />
            </View>
            
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back FoodieFlow!
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Sign in to continue cooking amazing recipes
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className={`
                flex-row items-center bg-gray-50 border rounded-xl px-4 py-3
                ${errors.email ? 'border-red-500' : 'border-gray-200'}
              `}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 ml-3 text-gray-900 text-base"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className={`
                flex-row items-center bg-gray-50 border rounded-xl px-4 py-3
                ${errors.password ? 'border-red-500' : 'border-gray-200'}
              `}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  className="flex-1 ml-3 text-gray-900 text-base"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-2"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} className="items-end">
              <Text className="text-orange-600 font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-orange-500 rounded-xl py-4 mt-8 shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold text-center">
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mt-8 mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 font-medium">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Register Link */}
          <TouchableOpacity 
            onPress={() => router.push("/(auth)/register")}
            className="items-center"
          >
            <Text className="text-gray-600 text-base">
              Don't have an account?{" "}
              <Text className="text-orange-600 font-semibold">Sign Up</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Login