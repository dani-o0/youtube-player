import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoPlayer({ videoUrl }) {
  // Extract video ID from URL
  const videoId = videoUrl.split('v=')[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.video}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
});

