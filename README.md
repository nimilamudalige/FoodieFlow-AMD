# 🍳 FoodieFlow (Recipe App)

A modern cross-platform **React Native Expo** mobile application for creating, managing, and discovering recipes.  
Built as the **ITS 2127 Advanced Mobile Developer** final project, this app demonstrates full-stack mobile development with authentication, CRUD operations, and real-time data synchronization using **Firebase**.

---

## 📋 Overview
The Recipe App allows users to:
- Create and manage personal recipes
- Explore and search for recipes by category or ingredients
- Save favorites and rate recipes
- Enjoy real-time updates and a smooth, responsive experience

---

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** – Secure login/register with Firebase Auth
- 📖 **Recipe Management** – Full CRUD (Create, Read, Update, Delete)
- 🔄 **Real-time Sync** – Automatic updates via Firestore listeners
- 🔍 **Search & Filter** – Find recipes by title, category, or ingredients
- ❤️ **Favorites & Ratings** – Save favorites and rate recipes (1–5 stars)

### User Experience
- 🎨 **Modern UI** – Clean orange theme and responsive design
- 🧭 **Smooth Navigation** – Tab navigation + stack flows for recipe details
- ⚡ **Instant Feedback** – Loading indicators, validations, and error handling
- 🔁 **Auto Refresh** – Live data updates without manual refresh

---

## 🛠️ Tech Stack
| Layer       | Technology |
|-------------|------------|
| **Frontend** | React Native (Expo), TypeScript, NativeWind (Tailwind), Expo Router, Expo Vector Icons |
| **Backend**  | Firebase Firestore (NoSQL real-time DB), Firebase Authentication |
| **State**    | React Context API + custom hooks |

---

## 📂 Project Structure
app/
├─ (auth)/                 # Authentication screens
│  ├─ _layout.tsx
│  ├─ login.tsx
│  └─ register.tsx
├─ (dashboard)/            # Main app screens
│  ├─ _layout.tsx          # Tab navigation
│  ├─ home.tsx             # Recipe feed/discovery
│  ├─ profile.tsx          # User profile
│  ├─ setting.tsx          # App settings
│  └─ recipes/             # Recipe management
│      ├─ _layout.tsx      # Stack navigation
│      ├─ index.tsx        # Recipe list
│      ├─ [id].tsx         # Add/Edit form
│      └─ view/[id].tsx    # Recipe detail
components/
├─ RecipeCard.tsx          # Recipe display component
└─ Loader.tsx              # Loading indicator
context/
├─ AuthContext.tsx         # Auth state management
├─ LoaderContext.tsx       # Global loading state
└─ RecipeContext.tsx       # Recipe CRUD state
services/
├─ authService.ts          # Authentication methods
├─ recipeService.ts        # Firestore CRUD methods
└─ userService.ts          # User profile management
types/
├─ recipe.ts               # Recipe type definitions
└─ user.ts                 # User type definitions




# 🧭 App Navigation

### Authentication Flow
Login → Register → Auto-redirect if authenticated

### Dashboard Tabs
- **Home**: Recipe discovery & search  
- **Recipes**: Manage personal recipes  
- **Profile**: User info & stats  
- **Settings**: App preferences  

### Recipe Flow
View → Edit/Delete → Auto-refresh list

---

## 🔮 Future Enhancements

Planned features:
- 📤 Social sharing capabilities  
- 🛒 Grocery list & meal planner  
- 🔔 Push notifications  
- ⚡ Offline synchronization & caching  
- 🎯 Advanced search filters & recommendations  

---

## 🧪 Testing

- **Manual Testing**: Authentication, CRUD operations, navigation, and validation  
- **Device Testing**: iOS/Android, various screen sizes, and network conditions  

---

## 📦 Build & Deployment

### Development Builds
```bash
npx expo build:android
npx expo build:ios
