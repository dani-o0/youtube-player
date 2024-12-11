import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthProvider';

export default function AddVideoAndList() {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const q = query(collection(db, "lists"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const listsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setLists(listsData);
  };

  const handleAddVideo = async () => {
    try {
      const currentDate = new Date(); // Obtener la fecha y hora actual
      const videoRef = await addDoc(collection(db, "videos"), {
        userId: user.uid,
        title: videoTitle,
        url: videoUrl,
        isFavorite: isFavorite,
        listId: selectedList || null,
        createdAt: currentDate.toISOString(),
      });
  
      if (selectedList) {
        const listRef = doc(db, "lists", selectedList);
        await updateDoc(listRef, {
          videos: arrayUnion(videoRef.id),
        });
      }
  
      setVideoTitle('');
      setVideoUrl('');
      setSelectedList('');
      setIsFavorite(false);
  
      alert('Video added successfully!');
    } catch (error) {
      console.error("Error adding video: ", error);
      alert('Error adding video. Please try again.');
    }
  };  

  const handleCreateList = async () => {
    try {
      await addDoc(collection(db, "lists"), {
        userId: user.uid,
        name: newListName,
        videos: [],
      });

      setNewListName('');
      fetchLists();

      alert('List created successfully!');
    } catch (error) {
      console.error("Error creating list: ", error);
      alert('Error creating list. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={styles.section}>
        <Text style={styles.header}>Add Video</Text>
        <TextInput
          style={styles.input}
          placeholder="Video Title"
          value={videoTitle}
          onChangeText={setVideoTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Video URL"
          value={videoUrl}
          onChangeText={setVideoUrl}
        />
        <Picker
          selectedValue={selectedList}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedList(itemValue)}
        >
          <Picker.Item label="Select a list" value="" />
          {lists.map((list) => (
            <Picker.Item key={list.id} label={list.name} value={list.id} />
          ))}
        </Picker>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddVideo}>
          <Text style={styles.addButtonText}>Add Video</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.section}>
        <Text style={styles.header}>Create List</Text>
        <TextInput
          style={styles.input}
          placeholder="List Name"
          value={newListName}
          onChangeText={setNewListName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreateList}>
          <Text style={styles.addButtonText}>Create List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b5998',
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  favoriteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
