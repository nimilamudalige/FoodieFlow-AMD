import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { authService } from "@/services/authService"
import { useLoader, LOADING_MESSAGES } from "@/context/LoaderContext"

const Register = () => {
  const router = useRouter()
  const { showLoader, hideLoader } = useLoader()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = async () => {
    try {
      showLoader(LOADING_MESSAGES.SIGNING_UP)
      
      const registerData = {
        name,
        email,
        password,
        confirmPassword
      }
      
      await authService.register(registerData)
      
      Alert.alert(
        "Welcome to Recipe App!", 
        "Your account has been created successfully!",
        [{ text: "Get Started", onPress: () => router.replace("/(dashboard)/home") }]
      )
    } catch (error: any) {
      Alert.alert(
        "Registration Failed", 
        error.message || "Something went wrong. Please try again."
      )
    } finally {
      hideLoader()
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
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="restaurant" size={40} color="#FF6B35" />
            </View>
            
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Join FoodieFlow!
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Create your account and start your culinary journey
            </Text>
          </View>

          {/* Registration Form */}
          <View className="space-y-4">
            {/* Full Name Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Full Name
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  className="flex-1 ml-3 text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
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
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 ml-3 text-gray-900 text-base"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2"
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            className="bg-orange-500 rounded-xl py-4 mt-8 shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold text-center">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="items-center mt-6"
          >
            <Text className="text-gray-600 text-base">
              Already have an account?{" "}
              <Text className="text-orange-600 font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Register