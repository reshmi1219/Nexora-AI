import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBusiness, Appointment } from "@/context/business";

const SERVICES = [
  "Consultation", "Hair Cut", "Massage", "Facial",
  "Training Session", "Coaching Call", "Checkup", "Other"
];

const TIMES = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<Appointment["status"], string> = {
  confirmed: "#00D4A0",
  pending: "#F59E0B",
  cancelled: "#EF4444",
};

function AppointmentCard({
  appt,
  onUpdate,
  onDelete,
}: {
  appt: Appointment;
  onUpdate: (status: Appointment["status"]) => void;
  onDelete: () => void;
}) {
  const color = STATUS_COLORS[appt.status];
  return (
    <View style={styles.apptCard}>
      <View style={[styles.apptAccent, { backgroundColor: color }]} />
      <View style={styles.apptContent}>
        <View style={styles.apptHeader}>
          <View style={styles.apptMeta}>
            <Text style={styles.apptClient}>{appt.clientName}</Text>
            <Text style={styles.apptService}>{appt.service}</Text>
          </View>
          <View style={[styles.apptStatus, { backgroundColor: color + "18" }]}>
            <Text style={[styles.apptStatusText, { color }]}>{appt.status}</Text>
          </View>
        </View>
        <View style={styles.apptDetails}>
          <View style={styles.apptDetail}>
            <Ionicons name="calendar-outline" size={13} color="#55557A" />
            <Text style={styles.apptDetailText}>{appt.date}</Text>
          </View>
          <View style={styles.apptDetail}>
            <Ionicons name="time-outline" size={13} color="#55557A" />
            <Text style={styles.apptDetailText}>{appt.time}</Text>
          </View>
          {appt.clientEmail ? (
            <View style={styles.apptDetail}>
              <Ionicons name="mail-outline" size={13} color="#55557A" />
              <Text style={styles.apptDetailText}>{appt.clientEmail}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.apptActions}>
          {appt.status === "pending" && (
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onUpdate("confirmed");
              }}
              style={[styles.actionBtn, { borderColor: "#00D4A040", backgroundColor: "#00D4A010" }]}
            >
              <Ionicons name="checkmark" size={14} color="#00D4A0" />
              <Text style={[styles.actionText, { color: "#00D4A0" }]}>Confirm</Text>
            </Pressable>
          )}
          {appt.status !== "cancelled" && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUpdate("cancelled");
              }}
              style={[styles.actionBtn, { borderColor: "#EF444440", backgroundColor: "#EF444410" }]}
            >
              <Ionicons name="close" size={14} color="#EF4444" />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              Alert.alert("Delete", "Remove this appointment?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: onDelete },
              ]);
            }}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color="#55557A" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Appointments() {
  const insets = useSafeAreaInsets();
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useBusiness();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("list");
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    service: "",
    time: "",
    notes: "",
  });

  const selectedDate = `${MONTH_NAMES[calMonth]} ${selectedDay}, ${calYear}`;
  const dayAppointments = appointments.filter((a) => a.date === selectedDate);
  const displayAppts = activeTab === "calendar" ? dayAppointments : appointments;

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const apptDays = new Set(
    appointments
      .filter((a) => {
        const parts = a.date.split(" ");
        return (
          parts[0] === MONTH_NAMES[calMonth] &&
          parts[2] === String(calYear)
        );
      })
      .map((a) => parseInt(a.date.split(" ")[1]))
  );

  const handleSubmit = async () => {
    if (!form.clientName.trim() || !form.service || !form.time) {
      Alert.alert("Missing fields", "Please fill in client name, service, and time.");
      return;
    }
    await addAppointment({
      clientName: form.clientName.trim(),
      clientEmail: form.clientEmail.trim(),
      service: form.service,
      date: selectedDate,
      time: form.time,
      status: "pending",
      notes: form.notes,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setForm({ clientName: "", clientEmail: "", service: "", time: "", notes: "" });
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS !== "web" ? insets.top + 24 : 67 + 24,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : 100,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Bookings</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowModal(true);
            }}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={["#3D7BFF", "#2563EB"]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.tabSwitch}>
          {(["list", "calendar"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                setActiveTab(t);
                Haptics.selectionAsync();
              }}
              style={[styles.tabSwitchBtn, activeTab === t && styles.tabSwitchBtnActive]}
            >
              <Text style={[styles.tabSwitchText, activeTab === t && styles.tabSwitchTextActive]}>
                {t === "list" ? "All" : "Calendar"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "calendar" && (
          <View style={styles.calendarCard}>
            <View style={styles.calNav}>
              <Pressable
                onPress={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                  else setCalMonth(m => m - 1);
                }}
                style={styles.calNavBtn}
              >
                <Ionicons name="chevron-back" size={18} color="#8888B0" />
              </Pressable>
              <Text style={styles.calTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
              <Pressable
                onPress={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                  else setCalMonth(m => m + 1);
                }}
                style={styles.calNavBtn}
              >
                <Ionicons name="chevron-forward" size={18} color="#8888B0" />
              </Pressable>
            </View>
            <View style={styles.calDayLabels}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <Text key={d} style={styles.calDayLabel}>{d}</Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                const isSelected = day === selectedDay;
                const hasAppt = apptDays.has(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      setSelectedDay(day);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.calCell,
                      isSelected && styles.calCellSelected,
                      isToday && !isSelected && styles.calCellToday,
                    ]}
                  >
                    <Text style={[
                      styles.calDayNum,
                      isSelected && styles.calDayNumSelected,
                      isToday && !isSelected && styles.calDayNumToday,
                    ]}>{day}</Text>
                    {hasAppt && <View style={[styles.apptDot, isSelected && { backgroundColor: "#fff" }]} />}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.calFooter}>
              <Text style={styles.calSelectedLabel}>{selectedDate}</Text>
              <Text style={styles.calApptCount}>
                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        )}

        {displayAppts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={36} color="#3D7BFF" />
            </View>
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "calendar"
                ? `Nothing scheduled for ${selectedDate}`
                : "Tap + to book your first appointment"}
            </Text>
          </View>
        ) : (
          <View style={styles.apptList}>
            {displayAppts.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onUpdate={(status) => updateAppointment(appt.id, { status })}
                onDelete={() => deleteAppointment(appt.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Pressable
              onPress={() => setShowModal(false)}
              style={styles.modalClose}
            >
              <Ionicons name="close" size={22} color="#8888B0" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalDate}>
              <Ionicons name="calendar" size={14} color="#3D7BFF" /> {selectedDate}
            </Text>

            {[
              { key: "clientName", label: "Client name *", placeholder: "Jane Smith", icon: "person-outline" as const },
              { key: "clientEmail", label: "Client email", placeholder: "jane@example.com", icon: "mail-outline" as const },
            ].map((f) => (
              <View key={f.key} style={styles.fieldGroup}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={f.icon} size={16} color="#55557A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#55557A"
                    value={form[f.key as keyof typeof form]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  />
                </View>
              </View>
            ))}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Service *</Text>
              <View style={styles.chipGroup}>
                {SERVICES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm((p) => ({ ...p, service: s }));
                    }}
                    style={[styles.chip, form.service === s && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, form.service === s && styles.chipTextSelected]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Time *</Text>
              <View style={styles.timeGrid}>
                {TIMES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm((p) => ({ ...p, time: t }));
                    }}
                    style={[styles.timeBtn, form.time === t && styles.timeBtnSelected]}
                  >
                    <Text style={[styles.timeBtnText, form.time === t && styles.timeBtnTextSelected]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={["#3D7BFF", "#2563EB"]}
                style={styles.submitBtnGradient}
              >
                <Text style={styles.submitBtnText}>Book Appointment</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040A" },
  scroll: { paddingHorizontal: 24, gap: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
    letterSpacing: -0.3,
  },
  addBtn: { borderRadius: 14, overflow: "hidden" },
  addBtnGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  tabSwitch: {
    flexDirection: "row",
    backgroundColor: "#151628",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabSwitchBtnActive: { backgroundColor: "#252640" },
  tabSwitchText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  tabSwitchTextActive: { color: "#E8E8F8" },
  calendarCard: {
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0D0E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  calTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  calDayLabels: { flexDirection: "row" },
  calDayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#55557A",
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  calCellSelected: {
    backgroundColor: "#3D7BFF",
    borderRadius: 10,
  },
  calCellToday: {
    backgroundColor: "#3D7BFF20",
    borderRadius: 10,
  },
  calDayNum: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#E8E8F8",
  },
  calDayNumSelected: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  calDayNumToday: { color: "#3D7BFF" },
  apptDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3D7BFF",
  },
  calFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1E1F35",
  },
  calSelectedLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8888B0",
  },
  calApptCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#3D7BFF",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#3D7BFF15",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
    textAlign: "center",
    maxWidth: 260,
  },
  apptList: { gap: 10 },
  apptCard: {
    flexDirection: "row",
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 16,
    overflow: "hidden",
  },
  apptAccent: { width: 4, flexShrink: 0 },
  apptContent: { flex: 1, padding: 16, gap: 10 },
  apptHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  apptMeta: { gap: 3 },
  apptClient: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E8F8",
  },
  apptService: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  apptStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apptStatusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  apptDetails: { gap: 4 },
  apptDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  apptDetailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#8888B0",
  },
  apptActions: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  deleteBtn: {
    marginLeft: "auto",
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: { flex: 1, backgroundColor: "#0D0E1A" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#252640",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#E8E8F8",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#151628",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: { padding: 24, gap: 20, paddingBottom: 60 },
  modalDate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#3D7BFF",
  },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8888B0" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#E8E8F8" },
  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  chipSelected: { backgroundColor: "#3D7BFF20", borderColor: "#3D7BFF" },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8888B0" },
  chipTextSelected: { color: "#3D7BFF" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#151628",
    borderWidth: 1,
    borderColor: "#252640",
  },
  timeBtnSelected: { backgroundColor: "#3D7BFF20", borderColor: "#3D7BFF" },
  timeBtnText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8888B0" },
  timeBtnTextSelected: { color: "#3D7BFF", fontFamily: "Inter_500Medium" },
  submitBtn: { borderRadius: 14, overflow: "hidden" },
  submitBtnGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
