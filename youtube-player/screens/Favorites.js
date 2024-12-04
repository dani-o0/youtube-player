import React, { useState, useContext } from 'react';
import { SafeAreaView, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import VideoPlayer from '../components/VideoPlayer';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { user } = useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      const fetchFavorites = async () => {
        const q = query(collection(db, "videos"), where("userId", "==", user.uid), where("isFavorite", "==", true));
        const querySnapshot = await getDocs(q);
        const favoritesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(favoritesData);
      };

      fetchFavorites();
    }, [user])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => setSelectedVideo(item)}>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (selectedVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <VideoPlayer videoUrl={selectedVideo.url} />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedVideo(null)}>
          <Text style={styles.backButtonText}>Back to Favorites</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDataText}>No favorite videos yet.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b5998',
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 18,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
