import React, { useState, useContext } from 'react';
import { Image, SafeAreaView, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import VideoPlayer from '../components/VideoPlayer';

export default function VideoLists() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchVideosForList = async (videoIds) => {
    const videoDocs = await Promise.all(
      videoIds.map(id => getDoc(doc(db, 'videos', id)))
    );
  
    const videos = videoDocs.map(doc => ({ id: doc.id, ...doc.data() }));
  
    // Ordenar los videos por fecha descendente
    const sortedVideos = videos.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // Más reciente primero
    });
  
    return sortedVideos;
  };

  // Maneja la selección de una lista y carga sus videos
  const handleListSelection = async (list) => {
    const videos = await fetchVideosForList(list.videos || []);
    setSelectedList({ ...list, videos });
  };

  // Carga las listas del usuario cuando la pantalla gana el foco
  useFocusEffect(
    React.useCallback(() => {
      const fetchLists = async () => {
        const q = query(collection(db, 'lists'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const listsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLists(listsData);
      };

      fetchLists();
    }, [user])
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleListSelection(item)}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.videos ? item.videos.length : 0} videos</Text>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => {
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

  // Si un video está seleccionado, muestra el reproductor
  if (selectedVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <VideoPlayer videoUrl={selectedVideo.url} />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedVideo(null)}>
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Si una lista está seleccionada, muestra los videos de esa lista
  if (selectedList) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>{selectedList.name}</Text>
        <FlatList
          data={selectedList.videos}
          renderItem={renderVideoItem}
          keyExtractor={(item, index) => item.id || index.toString()} // Asegura claves únicas
        />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedList(null)}>
          <Text style={styles.backButtonText}>Back to Lists</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Vista principal con las listas del usuario
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Video Lists</Text>
      {lists.length > 0 ? (
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={(item, index) => item.id || index.toString()} // Asegura claves únicas
        />
      ) : (
        <Text style={styles.noDataText}>No video lists created yet.</Text>
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
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  videoTitle: {
    fontSize: 18,
  },
  videoDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
