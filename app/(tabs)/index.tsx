import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppTheme, getAppTheme, ThemeMode } from "../../constants/theme";

const NGROK_URL = "https://unascendent-underfoot-tessa.ngrok-free.dev";
const THEME_KEY = "@appThemeMode";

// ---- Types for templates & history ----
type LessonTemplate = {
  id: string;
  name: string;
  school: string;
  teacher: string;
  gradeLevel: string;
  subject: string;
  quarter: string;
  week: string;
  day: string;
  timeAllotted: string;
  resourcesAvailable: string;
  previousLesson: string;
  planStyle: string;
  language: string;
  topicTitle: string;
};

type HistoryItem = {
  id: string;
  timestamp: number;
  subject: string;
  gradeLevel: string;
  topicTitle: string;
  date: string;
  lessonPlan: string;
};

export default function LessonPlanScreen() {
  // ✅ Theme (persisted)
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") setThemeMode(saved);
      } catch {}
    })();
  }, []);

  const theme = useMemo(() => getAppTheme(themeMode), [themeMode]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const toggleTheme = async () => {
    const next: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  // HEADER INFORMATION
  const [school, setSchool] = useState("");
  const [teacher, setTeacher] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [quarter, setQuarter] = useState("");
  const [week, setWeek] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // OBJECTIVES
  const [learningCompetencies, setLearningCompetencies] = useState("");

  // CONTENT
  const [topicTitle, setTopicTitle] = useState("");

  // ADDITIONAL INFORMATION
  const [timeAllotted, setTimeAllotted] = useState("");
  const [resourcesAvailable, setResourcesAvailable] = useState("");
  const [previousLesson, setPreviousLesson] = useState("");

  // AI OUTPUT PREFERENCES
  const [planStyle, setPlanStyle] = useState("DepEd Format (Philippines)");
  const [language, setLanguage] = useState("English");

  // OUTPUT
  const [lessonPlan, setLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Templates & History state
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

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
    resourcesAvailable,
    previousLesson,
  ].every((v) => v.trim().length > 0);

  // Load templates & history on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTemplates = await AsyncStorage.getItem("@lessonTemplates");
        if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
      } catch (err) {
        console.error("Failed to load templates:", err);
      }

      try {
        const savedHistory = await AsyncStorage.getItem("@lessonHistory");
        if (savedHistory) setHistoryItems(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    loadData();
  }, []);

  const saveTemplatesToStorage = async (updated: LessonTemplate[]) => {
    try {
      await AsyncStorage.setItem("@lessonTemplates", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save templates:", err);
    }
  };

  const saveHistoryToStorage = async (updated: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem("@lessonHistory", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const addHistoryEntry = async (generatedText: string) => {
    const entry: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      subject,
      gradeLevel,
      topicTitle,
      date,
      lessonPlan: generatedText,
    };

    const updated = [entry, ...historyItems].slice(0, 10);
    setHistoryItems(updated);
    await saveHistoryToStorage(updated);
  };

  const handleGenerate = async () => {
    if (!allRequiredFilled || loading) return;

    setLoading(true);
    setLessonPlan("");
    setGenerationStatus("idle");

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
- Resources Available: ${resourcesAvailable}
- Previous Lesson: ${previousLesson}
    `.trim();

    const prompt = `
You are an expert ${subject} teacher. Using the information below, create a detailed and classroom-ready lesson plan.

CRITICAL FORMATTING RULES:
- Your response must be plain text with a mix of icons/emojis that might help students visualize the activites, assessments, and asignments much better.
- Do NOT use Markdown at all (no **bold**, no headings with #, no bullet points that start with * asterisk).
- You may use numbered lists like "1." and simple hyphens "-" for bullets, but never use the "*" character.
- Do NOT add any introduction or explanation like "Here is a detailed lesson plan:".
- Do NOT add any closing markers like "(End of Lesson Plan)" or "End of lesson plan". The last line should be the last part of the assignment or enrichment section.
- The FIRST line of your response must be exactly: HEADER INFORMATION
- After that, continue the lesson plan in a clear, teacher-friendly format.

Content rules:
- Use clear sections such as: I. Objectives, II. Subject Matter / Content, III. Learning Activities, IV. Assessment, V. Assignment/Enrichment.
- Align the objectives with the given learning competencies (MELCs).
- Make activities age-appropriate for Grade ${gradeLevel}.
- Keep the tone professional but easy for teachers to follow.

Style preferences:
- Lesson plan style: ${planStyle}.
- Language preference: ${language}.
  If "Bilingual (English + Filipino)" is selected, combine English and Filipino in a natural classroom-appropriate way.

Here is the lesson information provided by the teacher:

${lessonInfo}
    `.trim();

    try {
      const response = await fetch(`${NGROK_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      let reply =
        data.reply ?? "Sorry, I couldn't generate a lesson plan. Please try again.";

      reply = reply.replace(/\*/g, "");
      const headerIndex = reply.indexOf("HEADER INFORMATION");
      if (headerIndex > -1) reply = reply.slice(headerIndex);
      reply = reply.trim();

      const endPatterns = [
        /\(?\s*end of lesson plan\s*\)?\.?$/i,
        /\(?\s*end of the lesson plan\s*\)?\.?$/i,
        /\(?\s*this concludes the lesson plan\s*\)?\.?$/i,
      ];
      for (const pattern of endPatterns) reply = reply.replace(pattern, "").trim();

      setLessonPlan(reply);
      setGenerationStatus("success");
      await addHistoryEntry(reply);
    } catch (err) {
      console.error(err);
      setLessonPlan(
        "Oops, something went wrong talking to Google AI. Check your connection or try again."
      );
      setGenerationStatus("error");
    } finally {
      setLoading(false);
    }
  };

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

  const buildBaseFileName = () => {
    const safePart = (value: string | undefined, fallback: string) => {
      const trimmed = (value || "").trim();
      return trimmed.length > 0 ? trimmed : fallback;
    };

    const safeSchool = safePart(school, "School");
    const safeSubject = safePart(subject, "Subject");
    const safeGrade = safePart(gradeLevel, "Grade");
    const safeDate = safePart(date, "Date");

    const raw = `${safeSchool}_${safeSubject}_${safeGrade}_${safeDate}`;
    return raw.replace(/[^\w.-]/g, "_");
  };

  const handleSaveAsWord = async () => {
    if (!lessonPlan) {
      Alert.alert("No content", "Generate a lesson plan first.");
      return;
    }

    try {
      const headerLines: string[] = [];
      if (school) headerLines.push(`School: ${school}`);
      if (teacher) headerLines.push(`Teacher: ${teacher}`);
      if (subject) headerLines.push(`Subject: ${subject}`);
      if (gradeLevel) headerLines.push(`Grade Level: ${gradeLevel}`);
      if (date) headerLines.push(`Date: ${date}`);

      const headerText = headerLines.length > 0 ? headerLines.join("\n") + "\n\n" : "";
      const fullText = headerText + lessonPlan;

      const escapeForRtf = (text: string) =>
        text.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");

      const escaped = escapeForRtf(fullText);
      const rtfBody = escaped.replace(/\n/g, "\\par\n");
      const rtfContent = `{\\rtf1\\ansi\n${rtfBody}\n}`;

      const baseName = buildBaseFileName();
      const fileName = `${baseName}.rtf`;

      const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

      if (!baseDir) {
        Alert.alert("Error", "No writable directory available on this platform.");
        return;
      }

      const fileUri = baseDir + fileName;

      await FileSystem.writeAsStringAsync(fileUri, rtfContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("File saved", `RTF file saved to: ${fileUri}`);
        return;
      }

      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.copyAsync({ from: fileUri, to: tempUri });

      await Sharing.shareAsync(tempUri, {
        mimeType: "application/rtf",
        dialogTitle: "Save or share lesson plan",
      });
    } catch (error) {
      console.error("Save as Word failed:", error);
      Alert.alert("Error", "Unable to save the lesson plan as a Word file. Please try again.");
    }
  };

  const handleSaveAsPDF = async () => {
    if (!lessonPlan) {
      Alert.alert("No content", "Generate a lesson plan first.");
      return;
    }

    try {
      const escapeHtml = (text: string) =>
        text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const headerTitle = school || "Lesson Plan";
      const teacherLine =
        teacher || subject
          ? `${teacher ? `Teacher: ${teacher}` : ""}${teacher && subject ? " • " : ""}${
              subject ? `Subject: ${subject}` : ""
            }`
          : "";
      const gradeDateLine =
        gradeLevel || date
          ? `${gradeLevel ? `Grade Level: ${gradeLevel}` : ""}${gradeLevel && date ? " • " : ""}${
              date ? `${date}` : ""
            }`
          : "";

      const headerHtml = `
        <div style="text-align:center; margin-bottom:16px;">
          <div style="font-size:16pt; font-weight:bold;">${escapeHtml(headerTitle)}</div>
          ${teacherLine ? `<div style="font-size:11pt; margin-top:4px;">${escapeHtml(teacherLine)}</div>` : ""}
          ${gradeDateLine ? `<div style="font-size:11pt; margin-top:2px;">${escapeHtml(gradeDateLine)}</div>` : ""}
        </div>
        <hr style="margin:12px 0; border:0; border-top:1px solid #e5e7eb;" />
      `;

      const lines = lessonPlan.split(/\r?\n/);
      const bodyHtml = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "<div style='height:6px;'></div>";
          if (trimmed.toUpperCase() === "HEADER INFORMATION") {
            return `<div style="font-size:14pt; font-weight:bold; margin-top:12px; margin-bottom:4px;">${escapeHtml(
              trimmed
            )}</div>`;
          }
          if (/^(I|V|X)+\.\s/.test(trimmed)) {
            return `<div style="font-weight:bold; margin-top:10px; margin-bottom:4px;">${escapeHtml(
              trimmed
            )}</div>`;
          }
          return `<div style="font-size:12pt; margin-bottom:2px;">${escapeHtml(line)}</div>`;
        })
        .join("");

      const html = `
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, system-ui, sans-serif; font-size: 12pt; line-height: 1.4; padding: 24px;">
            ${headerHtml}
            ${bodyHtml}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const baseName = buildBaseFileName();
      const pdfName = `${baseName}.pdf`;

      const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
      let finalUri = uri;

      if (baseDir) {
        const newUri = baseDir + pdfName;
        try {
          await FileSystem.moveAsync({ from: uri, to: newUri });
          finalUri = newUri;
        } catch (moveError) {
          console.warn("Failed to move PDF to nicer file name:", moveError);
        }
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("PDF created", `PDF file created at: ${finalUri}`);
        return;
      }

      await Sharing.shareAsync(finalUri, {
        mimeType: "application/pdf",
        dialogTitle: "Save or share lesson plan PDF",
      });
    } catch (error) {
      console.error("Save as PDF failed:", error);
      Alert.alert("Error", "Unable to save the lesson plan as a PDF file. Please try again.");
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setDate(formatted);
    }
  };

  const handleClearAll = () => {
    setSchool("");
    setTeacher("");
    setGradeLevel("");
    setSubject("");
    setQuarter("");
    setWeek("");
    setDay("");
    setDate("");
    setLearningCompetencies("");
    setTopicTitle("");
    setTimeAllotted("");
    setResourcesAvailable("");
    setPreviousLesson("");
    setPlanStyle("DepEd Format (Philippines)");
    setLanguage("English");
    setLessonPlan("");
    setGenerationStatus("idle");
  };

  const handleSaveTemplate = async () => {
    if (!school && !subject && !gradeLevel && !topicTitle) {
      Alert.alert(
        "Not enough info",
        "Please fill at least School, Subject, Grade Level, or Topic before saving a template."
      );
      return;
    }

    const normalize = (value: string) => value.trim().toLowerCase();

    const exists = templates.some((t) => {
      return (
        normalize(t.school) === normalize(school) &&
        normalize(t.subject) === normalize(subject) &&
        normalize(t.gradeLevel) === normalize(gradeLevel) &&
        normalize(t.topicTitle || "") === normalize(topicTitle || "")
      );
    });

    if (exists) {
      Alert.alert(
        "Duplicate template",
        "A template with the same School, Subject, Grade Level, and Topic already exists."
      );
      return;
    }

    const name = `${school || "School"} | ${subject || "Subject"} | ${gradeLevel || "Grade"}${
      topicTitle ? ` | ${topicTitle}` : ""
    }`;

    const newTemplate: LessonTemplate = {
      id: Date.now().toString(),
      name,
      school,
      teacher,
      gradeLevel,
      subject,
      quarter,
      week,
      day,
      timeAllotted,
      resourcesAvailable,
      previousLesson,
      planStyle,
      language,
      topicTitle,
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    await saveTemplatesToStorage(updated);

    Alert.alert("Template saved", "You can load this template any time.");
  };

  const applyTemplate = (tpl: LessonTemplate) => {
    setSchool(tpl.school || "");
    setTeacher(tpl.teacher || "");
    setGradeLevel(tpl.gradeLevel || "");
    setSubject(tpl.subject || "");
    setQuarter(tpl.quarter || "");
    setWeek(tpl.week || "");
    setDay(tpl.day || "");
    setTimeAllotted(tpl.timeAllotted || "");
    setResourcesAvailable(tpl.resourcesAvailable || "");
    setPreviousLesson(tpl.previousLesson || "");
    setPlanStyle(tpl.planStyle || "DepEd Format (Philippines)");
    setLanguage(tpl.language || "English");
    setTopicTitle(tpl.topicTitle || "");
  };

  const handleSelectTemplate = (tpl: LessonTemplate) => {
    applyTemplate(tpl);
    setTemplatesVisible(false);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setLessonPlan(item.lessonPlan);
    setGenerationStatus("success");
    setHistoryVisible(false);
  };

  const handleDeleteTemplate = (id: string) => {
    Alert.alert("Delete template", "Are you sure you want to delete this template? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = templates.filter((t) => t.id !== id);
          setTemplates(updated);
          await saveTemplatesToStorage(updated);
        },
      },
    ]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    Alert.alert("Delete history item", "Are you sure you want to delete this lesson plan from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = historyItems.filter((h) => h.id !== id);
          setHistoryItems(updated);
          await saveHistoryToStorage(updated);
        },
      },
    ]);
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
          keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "none"}
          onScrollBeginDrag={Keyboard.dismiss}
          onMomentumScrollBegin={Keyboard.dismiss}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>AI Lesson Plan Generator</Text>
              <Text style={styles.headerSubtitle}>
                Fill in the lesson details and let Google AI generate a complete lesson plan for you.
              </Text>
            </View>

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.75}>
              <Text style={styles.themeToggleText}>
                {themeMode === "dark" ? "☀️" : "🌙"}{" "}
                {themeMode === "dark" ? "Light" : "Dark"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* HEADER INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Header Information</Text>

            <Field
              styles={styles}
              theme={theme}
              label="School"
              value={school}
              onChangeText={setSchool}
              placeholder="e.g., Sample Elementary School"
            />

            <Field
              styles={styles}
              theme={theme}
              label="Teacher"
              value={teacher}
              onChangeText={setTeacher}
              placeholder="e.g., Juan Dela Cruz"
            />

            <DropdownField
              styles={styles}
              label="Grade Level"
              selectedValue={gradeLevel}
              onValueChange={setGradeLevel}
              placeholder="Select grade level"
              options={[
                { label: "Elementary", value: "header_elem", isHeader: true },
                { label: "Grade 1", value: "Grade 1" },
                { label: "Grade 2", value: "Grade 2" },
                { label: "Grade 3", value: "Grade 3" },
                { label: "Grade 4", value: "Grade 4" },
                { label: "Grade 5", value: "Grade 5" },
                { label: "Grade 6", value: "Grade 6" },

                { label: "Junior High School", value: "header_jhs", isHeader: true },
                { label: "Grade 7", value: "Grade 7" },
                { label: "Grade 8", value: "Grade 8" },
                { label: "Grade 9", value: "Grade 9" },
                { label: "Grade 10", value: "Grade 10" },

                { label: "Senior High School", value: "header_shs", isHeader: true },
                { label: "Grade 11", value: "Grade 11" },
                { label: "Grade 12", value: "Grade 12" },
              ]}
            />

            <Field
              styles={styles}
              theme={theme}
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Science"
            />

            <DropdownField
              styles={styles}
              label="Quarter"
              selectedValue={quarter}
              onValueChange={setQuarter}
              placeholder="Select quarter"
              options={[
                { label: "1st Quarter", value: "1st Quarter" },
                { label: "2nd Quarter", value: "2nd Quarter" },
                { label: "3rd Quarter", value: "3rd Quarter" },
                { label: "4th Quarter", value: "4th Quarter" },
              ]}
            />

            <DropdownField
              styles={styles}
              label="Week"
              selectedValue={week}
              onValueChange={setWeek}
              placeholder="Select week"
              options={Array.from({ length: 10 }, (_, i) => ({
                label: `Week ${i + 1}`,
                value: `Week ${i + 1}`,
              }))}
            />

            <DropdownField
              styles={styles}
              label="Day"
              selectedValue={day}
              onValueChange={setDay}
              placeholder="Select day"
              options={[
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
              ]}
            />

            {/* DATE PICKER */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <Text style={date ? styles.dateText : [styles.dateText, styles.datePlaceholder]}>
                  {date || "Tap to select date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date ? new Date(date) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          {/* OBJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            <Field
              styles={styles}
              theme={theme}
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
              styles={styles}
              theme={theme}
              label="Topic / Lesson Title"
              value={topicTitle}
              onChangeText={setTopicTitle}
              placeholder="e.g., The Structure of the Earth"
            />
          </View>

          {/* ADDITIONAL */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <DropdownField
              styles={styles}
              label="Time Allotted"
              selectedValue={timeAllotted}
              onValueChange={setTimeAllotted}
              placeholder="Select time"
              options={[
                { label: "30 minutes", value: "30 minutes" },
                { label: "45 minutes", value: "45 minutes" },
                { label: "60 minutes", value: "60 minutes" },
                { label: "90 minutes", value: "90 minutes" },
                { label: "120 minutes", value: "120 minutes" },
              ]}
            />

            <Field
              styles={styles}
              theme={theme}
              label="Resources Available"
              value={resourcesAvailable}
              onChangeText={setResourcesAvailable}
              placeholder="e.g., textbook, projector, worksheets"
              multiline
            />
            <Field
              styles={styles}
              theme={theme}
              label="Previous Lesson"
              value={previousLesson}
              onChangeText={setPreviousLesson}
              placeholder="e.g., Introduction to the Solar System"
              multiline
            />

            <View style={{ marginTop: 4 }}>
              <DropdownField
                styles={styles}
                label="Lesson Plan Style"
                selectedValue={planStyle}
                onValueChange={setPlanStyle}
                placeholder="Select style"
                options={[
                  { label: "DepEd Format (Philippines)", value: "DepEd Format (Philippines)" },
                  { label: "Detailed (very explicit steps)", value: "Detailed (very explicit steps)" },
                  { label: "Concise (short but complete)", value: "Concise (short but complete)" },
                  { label: "Activity-heavy (more student tasks)", value: "Activity-heavy (more student tasks)" },
                ]}
              />

              <DropdownField
                styles={styles}
                label="Language"
                selectedValue={language}
                onValueChange={setLanguage}
                placeholder="Select language"
                options={[
                  { label: "English", value: "English" },
                  { label: "Filipino", value: "Filipino" },
                  { label: "Bilingual (English + Filipino)", value: "Bilingual (English + Filipino)" },
                ]}
              />
            </View>
          </View>

          {/* Templates & History & Clear All */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Templates & History</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.templateButton} onPress={handleSaveTemplate} activeOpacity={0.7}>
                <Text style={styles.templateButtonText}>Save as Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.templateSecondaryButton}
                onPress={() => setTemplatesVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.templateSecondaryButtonText}>Load Template</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.historyButton} onPress={() => setHistoryVisible(true)} activeOpacity={0.7}>
                <Text style={styles.historyButtonText}>View History</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll} activeOpacity={0.7}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.button, (!allRequiredFilled || loading) && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={!allRequiredFilled || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Generate Lesson Plan</Text>
            )}
          </TouchableOpacity>

          {!allRequiredFilled && !loading && (
            <Text style={styles.helperText}>
              Please complete all fields above to enable lesson plan generation.
            </Text>
          )}

          {generationStatus === "success" && lessonPlan !== "" && (
            <Text style={styles.successMessage}>Your lesson plan has been generated successfully!</Text>
          )}

          {/* Output */}
          <View style={[styles.card, { marginBottom: 32 }]}>
            <Text style={styles.sectionTitle}>Generated Lesson Plan</Text>
            {lessonPlan ? (
              <>
                <Text style={styles.outputText}>{lessonPlan}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
                    <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveAsWord} activeOpacity={0.7}>
                    <Text style={styles.saveButtonText}>Save as Word File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.savePdfButton} onPress={handleSaveAsPDF} activeOpacity={0.7}>
                    <Text style={styles.savePdfButtonText}>Save as PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.placeholderOutput}>
                The generated lesson plan will appear here after you click "Generate Lesson Plan".
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Templates Modal */}
        <Modal
          visible={templatesVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTemplatesVisible(false)}
        >
          <View style={styles.fullScreenOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setTemplatesVisible(false)} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Saved Templates</Text>
              <ScrollView style={{ maxHeight: "70%", marginTop: 8 }} nestedScrollEnabled>
                {templates.length === 0 ? (
                  <Text style={styles.modalEmptyText}>
                    No templates yet. Fill the form and tap "Save as Template".
                  </Text>
                ) : (
                  templates.map((tpl) => (
                    <View key={tpl.id} style={styles.modalItem}>
                      <View style={styles.modalItemHeaderRow}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelectTemplate(tpl)} activeOpacity={0.7}>
                          <Text style={styles.modalItemTitle}>{tpl.name}</Text>
                          <Text style={styles.modalItemSubtitle}>
                            {tpl.subject} • {tpl.gradeLevel}
                            {tpl.topicTitle ? ` • Topic: ${tpl.topicTitle}` : ""}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDeleteTemplate(tpl.id)} activeOpacity={0.7}>
                          <Text style={styles.modalDeleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* History Modal */}
        <Modal visible={historyVisible} transparent animationType="fade" onRequestClose={() => setHistoryVisible(false)}>
          <View style={styles.fullScreenOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setHistoryVisible(false)} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Lesson Plan History</Text>
              <ScrollView style={{ maxHeight: "70%", marginTop: 8 }} nestedScrollEnabled>
                {historyItems.length === 0 ? (
                  <Text style={styles.modalEmptyText}>
                    No history yet. Generate a lesson plan to add entries.
                  </Text>
                ) : (
                  historyItems.map((item) => (
                    <View key={item.id} style={styles.modalItem}>
                      <View style={styles.modalItemHeaderRow}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelectHistoryItem(item)} activeOpacity={0.7}>
                          <Text style={styles.modalItemTitle}>
                            {item.subject} • {item.gradeLevel}
                          </Text>
                          <Text style={styles.modalItemSubtitle}>
                            {item.topicTitle || "No topic"} | {item.date || "No date"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDeleteHistoryItem(item.id)} activeOpacity={0.7}>
                          <Text style={styles.modalDeleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Reusable text field ----
type StylesType = ReturnType<typeof createStyles>;

type FieldProps = {
  styles: StylesType;
  theme: AppTheme;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

function Field({ styles, theme, label, value, onChangeText, placeholder, multiline }: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        multiline={multiline}
      />
    </View>
  );
}

// ---- Dropdown component with headers ----
type DropdownOption = {
  label: string;
  value: string;
  isHeader?: boolean;
};

type DropdownFieldProps = {
  styles: StylesType;
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: DropdownOption[];
};

function DropdownField({ styles, label, selectedValue, onValueChange, placeholder, options }: DropdownFieldProps) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const openDropdown = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 10, duration: 140, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  };

  const handleSelect = (opt: DropdownOption) => {
    if (opt.isHeader) return;
    onValueChange(opt.value);
    closeDropdown();
  };

  const displayText = selectedValue || placeholder || "Select an option";
  const isPlaceholder = !selectedValue;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity style={styles.dropdownButton} onPress={openDropdown} activeOpacity={0.7}>
        <View style={styles.dropdownInner}>
          <Text
            style={isPlaceholder ? styles.dropdownPlaceholderText : styles.dropdownValueText}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none" onRequestClose={closeDropdown}>
        <Pressable style={styles.dropdownOverlay} onPress={closeDropdown}>
          <Animated.View
            style={[
              styles.dropdownModalContent,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.dropdownModalTitle}>{label}</Text>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {options.map((opt) => {
                if (opt.isHeader) {
                  return (
                    <View key={opt.value} style={styles.dropdownHeader}>
                      <Text style={styles.dropdownHeaderText}>{opt.label}</Text>
                    </View>
                  );
                }

                const isSelected = opt.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                    onPress={() => handleSelect(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 55,
      paddingTop: 65,
    },

    headerRow: {
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 6,
    },
    themeToggle: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.card,
      alignSelf: "flex-start",
    },
    themeToggleText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    fieldContainer: {
      marginBottom: 10,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.label,
      marginBottom: 4,
    },
    input: {
      borderRadius: 10,
      backgroundColor: theme.inputBg,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: theme.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: theme.border,
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
      backgroundColor: theme.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.primaryText,
      fontWeight: "700",
      fontSize: 15,
    },

    helperText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.danger,
      textAlign: "center",
    },
    successMessage: {
      marginTop: 8,
      fontSize: 13,
      color: theme.success,
      textAlign: "center",
      fontWeight: "700",
    },

    outputText: {
      marginTop: 4,
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    placeholderOutput: {
      marginTop: 4,
      fontSize: 13,
      color: theme.placeholder,
      fontStyle: "italic",
    },

    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      gap: 8,
    },

    copyButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentGreen,
      backgroundColor: "transparent",
    },
    copyButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentGreenText,
    },

    saveButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentBlue,
      backgroundColor: "transparent",
    },
    saveButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentBlueText,
    },

    savePdfButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentOrange,
      backgroundColor: "transparent",
    },
    savePdfButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentOrangeText,
    },

    dateInput: {
      borderRadius: 10,
      backgroundColor: theme.inputBg,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dateText: {
      fontSize: 14,
      color: theme.text,
    },
    datePlaceholder: {
      color: theme.placeholder,
      fontStyle: "italic",
    },

    dropdownButton: {
      borderRadius: 10,
      backgroundColor: theme.inputBg,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: "center",
    },
    dropdownInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dropdownValueText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    dropdownPlaceholderText: {
      fontSize: 14,
      color: theme.placeholder,
      fontStyle: "italic",
      flex: 1,
      marginRight: 8,
    },
    dropdownArrow: {
      fontSize: 14,
      color: theme.textMuted,
    },
    dropdownOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    dropdownModalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      maxHeight: "70%",
      borderWidth: 1,
      borderColor: theme.border,
    },
    dropdownModalTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    dropdownScroll: {
      marginTop: 4,
    },
    dropdownHeader: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginTop: 4,
    },
    dropdownHeaderText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.textMuted,
      textTransform: "uppercase",
    },
    dropdownOption: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    dropdownOptionSelected: {
      backgroundColor: theme.dropdownSelectedBg,
    },
    dropdownOptionText: {
      fontSize: 14,
      color: theme.text,
    },
    dropdownOptionTextSelected: {
      fontWeight: "800",
    },

    templateButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentGreen,
    },
    templateButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentGreenText,
    },
    templateSecondaryButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentSky,
    },
    templateSecondaryButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentSkyText,
    },
    historyButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentPurple,
    },
    historyButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentPurpleText,
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.accentRed,
    },
    clearButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.accentRedText,
    },

    fullScreenOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
    },
    modalEmptyText: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 8,
    },
    modalItem: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    modalItemTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    modalItemSubtitle: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    modalItemHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    modalDeleteButtonText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.accentRedText,
    },
  });
}
