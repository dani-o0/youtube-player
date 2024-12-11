import React, { useState, useContext } from 'react';
import { Image, SafeAreaView, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
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
      
        // Ordenar por fecha en orden descendente
        const sortedFavorites = favoritesData.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Más reciente a menos reciente
        });
      
        setFavorites(sortedFavorites);
      };      

      fetchFavorites();
    }, [user])
  );

  const renderItem = ({ item }) => {
    let thumbnailUrl = '';

    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      const videoId = item.url.includes('v=')
        ? item.url.split('v=')[1].split('&')[0]
        : item.url.split('youtu.be/')[1];
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else if (item.url.includes('instagram.com')) {
      thumbnailUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png';
    }

    const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-EN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date';

    return (
      <TouchableOpacity style={styles.item} onPress={() => setSelectedVideo(item)}>
        <SafeAreaView style={styles.row}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          <SafeAreaView>
            <Text style={styles.videoTitle}>{item.title}</Text>
            <Text style={styles.videoDate}>{formattedDate}</Text>
          </SafeAreaView>
        </SafeAreaView>
      </TouchableOpacity>
    );
  };

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
  thumbnail: {
    width: 120,
    height: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  videoTitle: {
    fontSize: 18,
  },
  videoDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
