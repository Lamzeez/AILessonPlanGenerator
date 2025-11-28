import * as Clipboard from "expo-clipboard"; // 👈 NEW
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LessonPlanScreen() {
  // HEADER INFORMATION
  const [school, setSchool] = useState("");
  const [teacher, setTeacher] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [quarter, setQuarter] = useState("");
  const [week, setWeek] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");

  // OBJECTIVES
  const [learningCompetencies, setLearningCompetencies] = useState("");

  // CONTENT
  const [topicTitle, setTopicTitle] = useState("");

  // ADDITIONAL INFORMATION
  const [timeAllotted, setTimeAllotted] = useState("");
  const [resourcesAvailable, setResourcesAvailable] = useState("");
  const [previousLesson, setPreviousLesson] = useState("");

  // OUTPUT
  const [lessonPlan, setLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const allRequiredFilled = [
    school,
    teacher,
    gradeLevel,
    subject,
    quarter,
    week,
    day,
    date,
    learningCompetencies,
    topicTitle,
    timeAllotted,
  ].every((v) => v.trim().length > 0);

  const handleGenerate = async () => {
    if (!allRequiredFilled || loading) return;

    setLoading(true);
    setLessonPlan("");

    // Build a structured description to send to the backend
    const lessonInfo = `
HEADER INFORMATION
- School: ${school}
- Teacher: ${teacher}
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Quarter: ${quarter}
- Week: ${week}
- Day: ${day}
- Date: ${date}

OBJECTIVES
- Learning competencies (MELCs): ${learningCompetencies}

CONTENT
- Topic / Lesson Title: ${topicTitle}

ADDITIONAL INFORMATION
- Time Allotted: ${timeAllotted}
- Resources Available: ${resourcesAvailable || "Not specified"}
- Previous Lesson: ${previousLesson || "Not specified"}
    `.trim();

    const prompt = `
You are an expert ${subject} teacher. Using the information below, create a detailed and classroom-ready lesson plan.

Requirements:
- Use clear sections such as: I. Objectives, II. Subject Matter / Content, III. Learning Activities, IV. Assessment, V. Assignment/Enrichment.
- Align the objectives with the given learning competencies (MELCs).
- Make activities age-appropriate for Grade ${gradeLevel}.
- Use bullet points and numbering where helpful.
- Keep the tone professional but easy for teachers to follow.

Here is the lesson information provided by the teacher:

${lessonInfo}
    `.trim();

    try {
      const NGROK_URL = "https://unascendent-underfoot-tessa.ngrok-free.dev";

      const response = await fetch(`${NGROK_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });


      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setLessonPlan(
        data.reply ??
          "Sorry, I couldn't generate a lesson plan. Please try again."
      );
    } catch (err) {
      console.error(err);
      setLessonPlan(
        "Oops, something went wrong talking to Google AI. Check your connection or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 👇 NEW: copy-to-clipboard handler
  const handleCopy = async () => {
    if (!lessonPlan) return;

    try {
      await Clipboard.setStringAsync(lessonPlan);
      Alert.alert("Copied", "Lesson plan copied to clipboard.");
    } catch (error) {
      console.error("Copy failed:", error);
      Alert.alert("Error", "Failed to copy to clipboard.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Lesson Plan Generator</Text>
            <Text style={styles.headerSubtitle}>
              Fill in the lesson details and let Google AI generate a complete
              lesson plan for you.
            </Text>
          </View>

          {/* HEADER INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Header Information</Text>
            <Field
              label="School"
              value={school}
              onChangeText={setSchool}
              placeholder="e.g., Sample National High School"
            />
            <Field
              label="Teacher"
              value={teacher}
              onChangeText={setTeacher}
              placeholder="e.g., Juan Dela Cruz"
            />
            <Field
              label="Grade Level"
              value={gradeLevel}
              onChangeText={setGradeLevel}
              placeholder="e.g., Grade 7"
            />
            <Field
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Science"
            />
            <Field
              label="Quarter"
              value={quarter}
              onChangeText={setQuarter}
              placeholder="e.g., 1st Quarter"
            />
            <Field
              label="Week"
              value={week}
              onChangeText={setWeek}
              placeholder="e.g., Week 2"
            />
            <Field
              label="Day"
              value={day}
              onChangeText={setDay}
              placeholder="e.g., Day 1 (Monday)"
            />
            <Field
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="e.g., September 10, 2025"
            />
          </View>

          {/* OBJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            <Field
              label="Learning competencies (MELCs)"
              value={learningCompetencies}
              onChangeText={setLearningCompetencies}
              placeholder="Write or paste the MELCs here..."
              multiline
            />
          </View>

          {/* CONTENT */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Field
              label="Topic / Lesson Title"
              value={topicTitle}
              onChangeText={setTopicTitle}
              placeholder="e.g., The Structure of the Earth"
            />
          </View>

          {/* ADDITIONAL INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Field
              label="Time Allotted"
              value={timeAllotted}
              onChangeText={setTimeAllotted}
              placeholder="e.g., 60 minutes"
            />
            <Field
              label="Resources Available"
              value={resourcesAvailable}
              onChangeText={setResourcesAvailable}
              placeholder="e.g., textbook, projector, worksheets"
              multiline
            />
            <Field
              label="Previous Lesson"
              value={previousLesson}
              onChangeText={setPreviousLesson}
              placeholder="e.g., Introduction to the Solar System"
              multiline
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!allRequiredFilled || loading) && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!allRequiredFilled || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.buttonText}>Generate Lesson Plan</Text>
            )}
          </TouchableOpacity>

          {/* Output */}
          <View style={[styles.card, { marginBottom: 32 }]}>
            <Text style={styles.sectionTitle}>Generated Lesson Plan</Text>
            {lessonPlan ? (
              <>
                <Text style={styles.outputText}>{lessonPlan}</Text>

                {/* 👇 NEW: Copy button appears only when there is output */}
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.placeholderOutput}>
                The generated lesson plan will appear here after you click
                "Generate Lesson Plan".
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable field component
type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#0b1120",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ecfeff",
    fontWeight: "600",
    fontSize: 15,
  },
  outputText: {
    marginTop: 4,
    fontSize: 14,
    color: "#f9fafb",
    lineHeight: 20,
  },
  placeholderOutput: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },

  // 👇 NEW styles for the copy button
  copyButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
});
