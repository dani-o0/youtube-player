import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoPlayer({ videoUrl }) {
  let embedUrl = '';

  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('v=')
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('youtu.be/')[1];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('instagram.com')) {
    embedUrl = `${videoUrl}embed/`;
  } else {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.video}
        allowsFullscreenVideo={true}
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
