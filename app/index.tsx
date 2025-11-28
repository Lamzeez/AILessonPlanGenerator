import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Go to your main tab screen (where the generator lives)
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top "brand" area */}
        <View style={styles.headerRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LP</Text>
          </View>
          <View>
            <Text style={styles.appName}>AI Lesson Plan Generator</Text>
            <Text style={styles.appTagline}>
              Plan smarter, teach better, save time.
            </Text>
          </View>
        </View>

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

          {/* Highlight stats / benefits */}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Skip intro, go to generator →
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            You can always come back here by reopening the app.
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#bbf7d0",
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
  },
  appTagline: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
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
});
