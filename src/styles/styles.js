import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  
  safe: {
    flex: 1,
    backgroundColor: "#FDFBF7", 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 15,
    backgroundColor: "#F9F5EB", 
    borderBottomWidth: 1,
    borderBottomColor: "#EAE3D2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C2A29", 
  },
  headerBadge: {
    backgroundColor: "#E28743", 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  headerBadgeSmall: {
    color: "#FDFBF7",
    fontSize: 10,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Navigazione Tab Superiore ---
  tabs: {
    backgroundColor: "#F9F5EB",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE3D2",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#EEE6D3",
  },
  tabButtonActive: {
    backgroundColor: "#EEB76B", 
  },
  tabText: {
    color: "#605C58",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#2C2A29",
    fontWeight: "700",
  },

  // --- Elementi Comuni e Intestazioni Schermate ---
  screenTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2A29",
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: "#4A4643",
    lineHeight: 20,
    marginBottom: 12,
  },

  // --- Dashboard Griglia Metriche ---
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metric: {
    backgroundColor: "#FFFDF9",
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE3D2",
    shadowColor: "#2C2A29", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E28743", 
  },
  metricLabel: {
    fontSize: 12,
    color: "#7C7570",
    marginTop: 4,
    fontWeight: "500",
  },

  // --- Card, Pannelli e Righe ---
  panel: {
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  panelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2A29",
  },
  linkText: {
    color: "#E28743",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2A29",
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECE1",
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2A29",
  },
  rowMeta: {
    fontSize: 12,
    color: "#7C7570",
    marginTop: 2,
  },
  detailLine: {
    fontSize: 14,
    color: "#4A4643",
    marginBottom: 6,
  },

  // --- Input, Form e Ricerca ---
  input: {
    backgroundColor: "#FFFDF9",
    color: "#2C2A29",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#D2C9B1",
    marginBottom: 14,
  },
  textarea: {
    height: 80,
    textAlignVertical: "top",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2A29",
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 12,
  },

  // --- Pulsanti (Bottoni) ---
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  actionsCentered: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: "#E28743", 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#EEE6D3", 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#4A4643",
    fontWeight: "600",
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: "#FADBD8", 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#C0392B",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#EAE3D2",
    opacity: 0.6,
  },
  iconButton: {
    backgroundColor: "#EEE6D3",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: "#2C2A29",
    fontSize: 20,
    fontWeight: "bold",
  },

  // --- Badge di Stato e Priorità ---
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
  },
  statusBadge: {
    backgroundColor: "#EAE3D2",
    color: "#4A4643",
  },
  highBadge: {
    backgroundColor: "#F5C6AA", 
    color: "#7E3D11",
  },
  mediumBadge: {
    backgroundColor: "#F7E6C4", 
    color: "#7D5A13",
  },
  lowBadge: {
    backgroundColor: "#D5F5E3", 
    color: "#1E8449",
  },

  // --- Grafici e Progress Bar ---
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  chartLabel: {
    width: "35%",
    fontSize: 13,
    color: "#4A4643",
  },
  chartTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F4ECE1",
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    backgroundColor: "#EEB76B", 
    borderRadius: 4,
  },
  chartValue: {
    width: "12%",
    fontSize: 13,
    fontWeight: "600",
    color: "#2C2A29",
    textAlign: "right",
  },
  progressBlock: {
    marginTop: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F4ECE1",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E28743", 
    borderRadius: 3,
  },

  // --- Segmented Control ---
  segmented: {
    paddingVertical: 4,
    marginBottom: 14,
    gap: 6,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#EAE3D2",
    minWidth: 70,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#E28743",
    borderColor: "#E28743",
  },
  segmentText: {
    color: "#7C7570",
    fontSize: 12,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },

  // --- Planner Settimanale & Calendario ---
  weekBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F5EB",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2A29",
  },
  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#F9F5EB",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  dayColumn: {
    alignItems: "center",
    width: "13.5%",
  },
  dayLabel: {
    fontSize: 11,
    color: "#7C7570",
    fontWeight: "600",
  },
  dayDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2A29",
    marginVertical: 4,
  },
  miniSession: {
    backgroundColor: "#FFFDF9",
    borderRadius: 6,
    padding: 4,
    width: "100%",
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#EAE3D2",
    borderLeftWidth: 3,
    borderLeftColor: "#EEB76B",
  },
  miniSessionDone: {
    opacity: 0.5,
    backgroundColor: "#F4ECE1",
    borderLeftColor: "#7C7570",
  },
  miniSessionText: {
    fontSize: 8,
    color: "#2C2A29",
    fontWeight: "500",
  },
  miniSessionMeta: {
    fontSize: 7,
    color: "#7C7570",
  },

  // --- Pomodoro Screen ---
  timerPanel: {
    backgroundColor: "#F9F5EB",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  timerMode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E28743",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#2C2A29",
    fontVariant: ["tabular-nums"],
    marginVertical: 10,
  },

  // --- Modali e Fogli di Dettaglio ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(44, 42, 41, 0.4)", 
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2A29",
    marginBottom: 6,
  },
});

export default styles;








