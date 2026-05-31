import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useContext } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import { ThemeContext } from "../contexts/themeContext";
import DangerButton from "./danger-button";
import Segmented from "./segmented";

export default function SettingsModal({
  visible,
  onClose,
  settings,
  updateSetting,
  resetAllData,
}) {
  const { styles, themeColors } = useStyles();
  const { theme, selectTheme } = useContext(ThemeContext);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { maxHeight: "80%" }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialIcons name="settings" size={24} color={themeColors.primary} />
              <Text style={styles.modalTitle}>Impostazioni</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {/* TEMA */}
            <View style={styles.panel}>
              <Text style={[styles.panelTitle, { marginBottom: 8 }]}>{"Tema dell'applicazione"}</Text>
              <Segmented
                options={["light", "dark", "system"]}
                labels={{
                  light: "Chiaro",
                  dark: "Scuro",
                  system: "Automatico"
                }}
                value={theme}
                onChange={selectTheme}
              />
            </View>

            {/* TIMER POMODORO */}
            <View style={styles.panel}>
              <Text style={[styles.panelTitle, { marginBottom: 12 }]}>Timer Pomodoro ⏱️</Text>
              
              <Text style={[styles.label, { fontSize: 13, marginBottom: 6 }]}>Tempo di Studio</Text>
              <Segmented
                options={["15", "20", "25", "30", "45", "60"]}
                labels={{
                  "15": "15m",
                  "20": "20m",
                  "25": "25m",
                  "30": "30m",
                  "45": "45m",
                  "60": "60m"
                }}
                value={settings.pomodoroStudyTime || "25"}
                onChange={(val) => updateSetting("pomodoroStudyTime", val)}
              />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, marginBottom: 12 }}>
                <Text style={[styles.bodyText, { fontSize: 13, marginBottom: 0, flex: 1 }]}>Minuti personalizzati (max 60m):</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 0, paddingVertical: 6, paddingHorizontal: 12, fontSize: 14, minWidth: 60, textAlign: "center" }]}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="25"
                  placeholderTextColor={themeColors.textMuted}
                  value={settings.pomodoroStudyTime || ""}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, "");
                    if (clean === "") {
                      updateSetting("pomodoroStudyTime", "");
                    } else {
                      const num = parseInt(clean, 10);
                      if (num > 60) {
                        updateSetting("pomodoroStudyTime", "60");
                      } else if (num >= 1) {
                        updateSetting("pomodoroStudyTime", String(num));
                      } else {
                        updateSetting("pomodoroStudyTime", clean);
                      }
                    }
                  }}
                />
              </View>

              <Text style={[styles.label, { fontSize: 13, marginTop: 6, marginBottom: 6 }]}>Tempo di Pausa</Text>
              <Segmented
                options={["3", "5", "10", "15"]}
                labels={{
                  "3": "3m",
                  "5": "5m",
                  "10": "10m",
                  "15": "15m"
                }}
                value={settings.pomodoroBreakTime || "5"}
                onChange={(val) => updateSetting("pomodoroBreakTime", val)}
              />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, marginBottom: 4 }}>
                <Text style={[styles.bodyText, { fontSize: 13, marginBottom: 0, flex: 1 }]}>Minuti personalizzati (max 60m):</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 0, paddingVertical: 6, paddingHorizontal: 12, fontSize: 14, minWidth: 60, textAlign: "center" }]}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="5"
                  placeholderTextColor={themeColors.textMuted}
                  value={settings.pomodoroBreakTime || ""}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, "");
                    if (clean === "") {
                      updateSetting("pomodoroBreakTime", "");
                    } else {
                      const num = parseInt(clean, 10);
                      if (num > 60) {
                        updateSetting("pomodoroBreakTime", "60");
                      } else if (num >= 1) {
                        updateSetting("pomodoroBreakTime", String(num));
                      } else {
                        updateSetting("pomodoroBreakTime", clean);
                      }
                    }
                  }}
                />
              </View>
            </View>

            {/* FEEDBACK */}
            <View style={styles.panel}>
              <Text style={[styles.panelTitle, { marginBottom: 8 }]}>Feedback e Interazione</Text>
              <View style={[styles.filterRow, { marginBottom: 0, paddingVertical: 4 }]}>
                <Text style={styles.label}>Vibrazione (Feedback Aptico)</Text>
                <Switch
                  value={settings.hapticsEnabled !== false}
                  onValueChange={(val) => updateSetting("hapticsEnabled", val)}
                  trackColor={{ false: themeColors.border, true: themeColors.primary }}
                  thumbColor={themeColors.card}
                />
              </View>
            </View>

            {/* INFO APP */}
            <View style={styles.panel}>
              <Text style={[styles.panelTitle, { marginBottom: 8 }]}>Informazioni</Text>
              <Text style={styles.bodyText}>
                <Text style={{ fontWeight: "700" }}>Study Planner & Exam Tracker</Text>{"\n"}
                Versione: 1.0.0{"\n"}
                Sviluppato da: Gruppo 3 (MOBPROG)
              </Text>
            </View>

            {/* ZONA DI PERICOLO */}
            <View style={[styles.panel, { borderColor: themeColors.dangerText + "40", borderWidth: 1.5 }]}>
              <Text style={[styles.panelTitle, { color: themeColors.dangerText, marginBottom: 6 }]}>
                Attenzione ⚠️
              </Text>
              <Text style={[styles.bodyText, { fontSize: 13, marginBottom: 14 }]}>
                {"Questa opzione ripristina l'applicazione allo stato iniziale, eliminando tutti i dati inseriti (corsi, esami, planner e obiettivi)."}
              </Text>
              <View style={{ alignItems: "flex-start" }}>
                <DangerButton
                  onPress={resetAllData}
                  itemName="Tutti i dati dell'applicazione"
                  itemType="database"
                  warningMessage="Questa azione eliminerà permanentemente tutti i tuoi corsi, esami, obiettivi e sessioni di studio, ripristinando il database ai dati di fabbrica."
                  label="Ripristina"
                  confirmLabel="Ripristina"
                />
              </View>
            </View>

          </ScrollView>

          <Pressable 
            style={[styles.primaryButton, { marginTop: 16 }]} 
            onPress={onClose}
          >
            <Text style={styles.primaryButtonText}>Chiudi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
