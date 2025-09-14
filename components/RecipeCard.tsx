// components/RecipeCard.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Image, StyleSheet, 
  Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/recipe';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  showLike?: boolean;
  onLike?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2; // Two cards per row with margins

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onPress, 
  onEdit, 
  onDelete,
  showActions = true,
  showLike = true,
  onLike
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(recipe.likes);

  // Check if user has liked this recipe
  useEffect(() => {
    if (user && showLike) {
      checkLikeStatus();
    }
  }, [user, recipe.id]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const liked = await recipeService.hasUserLiked(recipe.id, user.uid);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like recipes');
      return;
    }

    try {
      const wasLiked = await recipeService.toggleLike(recipe.id, user.uid);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      
      if (onLike) {
        onLike();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete && onDelete()
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'partly-sunny-outline';
      case 'dinner': return 'moon-outline';
      case 'snack': return 'cafe-outline';
      case 'dessert': return 'ice-cream-outline';
      default: return 'restaurant-outline';
    }
  };

  const canEdit = user && (user.uid === recipe.createdBy || isAdmin());
  const canDelete = user && (user.uid === recipe.createdBy || isAdmin());

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Recipe Image */}
      <View style={styles.imageContainer}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {/* Category Icon */}
        <View style={styles.categoryBadge}>
          <Ionicons 
            name={getCategoryIcon(recipe.category) as any} 
            size={16} 
            color="white" 
          />
        </View>

        {/* Approval Status (for admin/owner) */}
        {(canEdit || canDelete) && (
          <View style={styles.statusContainer}>
            {!recipe.isApproved && (
              <View style={[styles.statusBadge, styles.pendingBadge]}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            )}
            {!recipe.isPublic && recipe.isApproved && (
              <View style={[styles.statusBadge, styles.privateBadge]}>
                <Text style={styles.statusText}>Private</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Recipe Info */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        {/* Recipe Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{recipe.cookingTime}min</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{recipe.servings}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(recipe.difficulty) }]} />
            <Text style={[styles.metaText, { textTransform: 'capitalize' }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* Creator Info */}
        <View style={styles.creatorContainer}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.creatorText}>by {recipe.createdByName}</Text>
        </View>

        {/* Engagement Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.statText}>{recipe.views}</Text>
          </View>
          
          {showLike && (
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={handleLike}
              disabled={!user}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={14} 
                color={isLiked ? "#FF6B6B" : "#666"} 
              />
              <Text style={[styles.statText, isLiked && styles.likedText]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        {showActions && (canEdit || canDelete) && (
          <View style={styles.actionContainer}>
            {canEdit && onEdit && (
              <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                <Ionicons name="create-outline" size={16} color="#4CAF50" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            )}
            
            {canDelete && onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#F44336" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  privateBadge: {
    backgroundColor: '#757575',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  likedText: {
    color: '#FF6B6B',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  editText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 4,
    fontWeight: '600',
  },
});