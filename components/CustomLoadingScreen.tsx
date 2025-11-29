import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function CustomLoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/AILessonPlanGeneratorLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>AI Lesson Plan Generator</Text>
      <Text style={styles.tagline}>Plan smarter, teach better, save time.</Text>

      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
});
