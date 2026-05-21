import { StyleSheet, Platform } from "react-native";
import colors from "./colors";

export default StyleSheet.create({
  // --- Layout principale ---
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 80,
  },

  // --- Header ---
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 15,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },

  // --- Sezioni ---
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textDark,
  },

  // --- Metriche ---
  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  metric: {
    backgroundColor: colors.panel,
    padding: 15,
    borderRadius: 10,
    width: "23%",
    alignItems: "center",
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primaryDark,
  },

  metricLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // --- Card ---
  card: {
    backgroundColor: colors.panel,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },

  rowMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  bodyText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 10,
  },

  // --- Badge ---
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },

  highBadge: { backgroundColor: "#D9534F" },
  mediumBadge: { backgroundColor: "#F0AD4E" },
  lowBadge: { backgroundColor: "#5BC0DE" },

  statusBadge: {
    backgroundColor: colors.primaryDark,
  },

  // --- Panel ---
  panel: {
    backgroundColor: colors.panel,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  panelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },

  linkText: {
    color: colors.primaryDark,
    fontWeight: "bold",
  },

  // --- Input ---
  field: {
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.textDark,
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.textDark,
  },

  textarea: {
    height: 100,
    textAlignVertical: "top",
  },

  // --- Buttons ---
  primaryButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: colors.primaryDark,
    fontWeight: "bold",
  },

  dangerButton: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  dangerButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  // --- Modal ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textDark,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  actionsCentered: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.4,
  },

  // --- Segmented ---
  segmented: {
    flexDirection: "row",
    marginVertical: 10,
  },

  segment: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
  },

  segmentActive: {
    backgroundColor: colors.primaryDark,
  },

  segmentText: {
    color: colors.textDark,
    fontWeight: "bold",
  },

  segmentTextActive: {
    color: "white",
  },

  // --- Planner ---
  weekBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },

  weekTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textDark,
  },

  iconButton: {
    padding: 10,
  },

  iconButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primaryDark,
  },

  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dayColumn: {
    alignItems: "center",
    width: "13%",
  },

  dayLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },

  dayDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.textDark,
  },

  miniSession: {
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },

  miniSessionDone: {
    backgroundColor: colors.primaryDark,
  },

  miniSessionText: {
    fontSize: 12,
    color: "white",
  },

  miniSessionMeta: {
    fontSize: 10,
    color: "white",
  },

  // --- Timer ---
  timerPanel: {
    backgroundColor: colors.panel,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  timerMode: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },

  timer: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 10,
    color: colors.primaryDark,
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  tabItem: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textMuted,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  tabItemActive: {
    color: colors.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryDark,
  },
});


  