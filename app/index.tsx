import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const [showTips, setShowTips] = useState(false);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run when screen mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        delay: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, logoScale, taglineOpacity]);

  const handleGetStarted = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated header with logo */}
        <Animated.View
          style={[
            styles.headerCentered,
            {
              opacity: headerOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Glow wrapper */}
          <View style={styles.logoGlowWrapper}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appNameCentered}>AI Lesson Plan Generator</Text>

          <Animated.Text
            style={[
              styles.appTaglineCentered,
              { opacity: taglineOpacity },
            ]}
          >
            Plan smarter, teach better, save time.
          </Animated.Text>
        </Animated.View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>For Teachers and Aspiring Teachers ✨</Text>
          </View>

          <Text style={styles.heroTitle}>
            Create complete lesson plans in minutes, not hours.
          </Text>

          <Text style={styles.heroSubtitle}>
            Let AI help you turn MELCs, topics, and class details into a
            structured, classroom-ready lesson plan.
          </Text>

          <View style={styles.heroRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>DepEd-aligned</Text>
              <Text style={styles.heroPillValue}>MELC-based</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>Formats</Text>
              <Text style={styles.heroPillValue}>Word & PDF</Text>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>Languages</Text>
              <Text style={styles.heroPillValue}>EN / FIL / Bilingual</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>Grade Levels</Text>
              <Text style={styles.heroPillValue}>1–12</Text>
            </View>
          </View>
        </View>

        {/* Feature list */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What you can do here</Text>

          <FeatureItem
            title="Generate complete lesson plans"
            description="From Header Information to Assessment and Assignment sections, ready to use or edit."
          />
          <FeatureItem
            title="Save templates"
            description="Reuse your school, subject, grade level, and lesson setup with one tap."
          />
          <FeatureItem
            title="Export & share"
            description="Copy to clipboard or export as Word (.rtf) or PDF to refine and print."
          />
          <FeatureItem
            title="Keep a lesson history"
            description="Revisit and reload your last generated lesson plans anytime."
          />
        </View>

        {/* Bottom actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Text style={styles.primaryButtonSubtext}>
              Open the AI Lesson Plan Generator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowTips(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              View quick tips & how it works
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            You can always close and reopen the app to see this screen again.
          </Text>
        </View>
      </ScrollView>

      {/* Quick Tips Modal */}
      <Modal
        visible={showTips}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTips(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowTips(false)}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quick Tips</Text>
            <Text style={styles.modalText}>
              1. Fill in all required fields: school, teacher, grade level,
              subject, quarter, week, day, date, MELCs, topic, time, resources,
              and previous lesson.
            </Text>
            <Text style={styles.modalText}>
              2. Choose your preferred lesson plan style and language.
            </Text>
            <Text style={styles.modalText}>
              3. Tap "Generate Lesson Plan" to get a complete DepEd-style plan.
            </Text>
            <Text style={styles.modalText}>
              4. Save templates to reuse your teaching setup.
            </Text>
            <Text style={styles.modalText}>
              5. Export as Word/PDF for printing or editing.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTips(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type FeatureItemProps = {
  title: string;
  description: string;
};

function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureBullet}>
        <Text style={styles.featureBulletText}>●</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 45, // vertical padding from top
    paddingBottom: 45, // vertical padding from bottom
  },

  // Centered animated header
  headerCentered: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoGlowWrapper: {
    padding: 0,
    borderRadius: 12,
    backgroundColor: "#1d4ed8", // subtle blue base
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12, // Android glow
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  appNameCentered: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "700",
    color: "#f9fafb",
    textAlign: "center",
  },
  appTaglineCentered: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
  },

  heroCard: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.15)",
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6ee7b7",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  heroPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  heroPillLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  heroPillValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },

  featuresCard: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  featureBullet: {
    width: 18,
    alignItems: "center",
    paddingTop: 2,
  },
  featureBulletText: {
    fontSize: 10,
    color: "#22c55e",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f9fafb",
  },
  featureDescription: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },

  actionsContainer: {
    marginTop: 4,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ecfeff",
  },
  primaryButtonSubtext: {
    fontSize: 11,
    color: "#e0f2fe",
    marginTop: 2,
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9ca3af",
  },
  footerHint: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#020617",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 12,
    color: "#d1d5db",
    marginBottom: 6,
  },
  modalButton: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: "#10b981",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ecfeff",
  },
});
