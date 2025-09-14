// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecipeProvider } from './context/RecipeContext';

// Auth Screens (assuming auth folder exists)
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';

// Dashboard/Home Screens
import DashboardLayout from './app/(dashboard)/_layout';
import HomeScreen from './app/(dashboard)/home';
import ProfileScreen from './app/(dashboard)/profile';
import SettingScreen from './app/(dashboard)/setting';

// Recipe Screens
import RecipesLayout from './app/(dashboard)/recipies/_layout';
import Index from './app/(dashboard)/recipies/index';

// Import other necessary screens
// You may need to create these based on your structure

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF6B6B" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Auth Stack Navigator
const AuthStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FF6B6B' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ 
        title: 'Create Account'
      }}
    />
  </Stack.Navigator>
);

// Customer Tab Navigator (based on your folder structure)
const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Recipes':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          case 'Settings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'home-outline';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B6B',
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: '#FF6B6B' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Discover Recipes' }}
    />
    <Tab.Screen 
      name="Recipes" 
      component={Index}
      options={{ title: 'My Recipes' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingScreen}
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

// Admin Tab Navigator (for admin users)
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'analytics' : 'analytics-outline';
            break;
          case 'Users':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Recipes':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Settings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'analytics-outline';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: '#4CAF50' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={HomeScreen} // You can create AdminDashboard component
      options={{ title: 'Admin Dashboard' }}
    />
    <Tab.Screen 
      name="Users" 
      component={ProfileScreen} // Create AdminUsers component
      options={{ title: 'Manage Users' }}
    />
    <Tab.Screen 
      name="Recipes" 
      component={Index}
      options={{ title: 'All Recipes' }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingScreen}
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

// Main Dashboard Stack Navigator
const DashboardStackNavigator = () => {
  const { isAdmin } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: isAdmin() ? '#4CAF50' : '#FF6B6B' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="DashboardTabs" 
        component={isAdmin() ? AdminTabNavigator : CustomerTabNavigator}
        options={{ headerShown: false }}
      />
      {/* Add more stack screens as needed */}
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth screens if user is not logged in
  if (!user || !userProfile) {
    return <AuthStackNavigator />;
  }

  // Show dashboard for authenticated users
  return <DashboardStackNavigator />;
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <RecipeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </RecipeProvider>
    </AuthProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default App;