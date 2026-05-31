import { Platform, StyleSheet } from "react-native";

export const getStyles = (themeColors) => StyleSheet.create({
  
  safe: {
    flex: 1,
    backgroundColor: themeColors.background, 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 15,
    backgroundColor: themeColors.surface, 
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerIconButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: themeColors.surfaceAlt,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16,
  gap: 6,
},
headerIconButtonActive: {
  backgroundColor: themeColors.primary,
},
headerIconLabel: {
  fontSize: 13,
  fontWeight: "600",
  color: themeColors.textTitle,
},
headerIconLabelActive: {
  color: themeColors.textOnPrimary,
},

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeColors.textTitle, 
  },
  headerBadge: {
    backgroundColor: themeColors.primary, 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  headerBadgeText: {
    color: themeColors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 14,
  },
  headerBadgeSmall: {
    color: themeColors.textOnPrimary,
    fontSize: 10,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },

  // --- Navigazione Tab Superiore ---
  tabs: {
    backgroundColor: themeColors.surface,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: themeColors.surfaceAlt,
  },
  tabButtonActive: {
    backgroundColor: themeColors.primaryLight, 
  },
  tabText: {
    color: themeColors.textBody,
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: themeColors.textTitle,
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
    color: themeColors.textTitle,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: themeColors.textBody,
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
    backgroundColor: themeColors.card,
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    shadowColor: "#000000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: themeColors.primary, 
  },
  metricLabel: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },

  // --- Card, Pannelli e Righe ---
  panel: {
    backgroundColor: themeColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
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
    color: themeColors.textTitle,
  },
  linkText: {
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
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
    color: themeColors.textTitle,
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: themeColors.textTitle,
  },
  rowMeta: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  detailLine: {
    fontSize: 14,
    color: themeColors.textBody,
    marginBottom: 6,
  },

  // --- Input, Form e Ricerca ---
  input: {
    backgroundColor: themeColors.card,
    color: themeColors.textTitle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: themeColors.borderDark,
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
    color: themeColors.textTitle,
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

  bottomNav: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderTopWidth: 1,
  borderTopColor: themeColors.border,
  backgroundColor: themeColors.surface,
},
bottomNavItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 6,
  borderRadius: 16,
},
bottomNavItemActive: {
  backgroundColor: themeColors.primaryLight,
},
bottomNavLabel: {
  fontSize: 12,
  marginTop: 2,
  color: themeColors.textBody,
  fontWeight: "600",
},
bottomNavLabelActive: {
  color: themeColors.textTitle,
},

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
    backgroundColor: themeColors.primary, 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: themeColors.textOnPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: themeColors.surfaceAlt, 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: themeColors.textBody,
    fontWeight: "600",
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: themeColors.dangerBg, 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: themeColors.dangerText,
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: themeColors.border,
    opacity: 0.6,
  },
  iconButton: {
    backgroundColor: themeColors.surfaceAlt,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: themeColors.textTitle,
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
    backgroundColor: themeColors.border,
    color: themeColors.textBody,
  },
  highBadge: {
    backgroundColor: themeColors.badgeHighBg, 
    color: themeColors.badgeHighText,
  },
  mediumBadge: {
    backgroundColor: themeColors.badgeMedBg, 
    color: themeColors.badgeMedText,
  },
  lowBadge: {
    backgroundColor: themeColors.badgeLowBg, 
    color: themeColors.badgeLowText,
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
    color: themeColors.textBody,
  },
  chartTrack: {
    flex: 1,
    height: 8,
    backgroundColor: themeColors.borderLight,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    backgroundColor: themeColors.primaryLight, 
    borderRadius: 4,
  },
  chartValue: {
    width: "12%",
    fontSize: 13,
    fontWeight: "600",
    color: themeColors.textTitle,
    textAlign: "right",
  },
  progressBlock: {
    marginTop: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: themeColors.borderLight,
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: themeColors.primary, 
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
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    minWidth: 70,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  segmentText: {
    color: themeColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: themeColors.textOnPrimary,
  },

  // --- Planner Settimanale & Calendario ---
  weekBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themeColors.surface,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: themeColors.textTitle,
  },
  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: themeColors.surface,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  dayColumn: {
    alignItems: "center",
    width: "13.5%",
  },
  dayLabel: {
    fontSize: 11,
    color: themeColors.textMuted,
    fontWeight: "600",
  },
  dayDate: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textTitle,
    marginVertical: 4,
  },
  miniSession: {
    backgroundColor: themeColors.card,
    borderRadius: 6,
    padding: 4,
    width: "100%",
    marginTop: 2,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderLeftWidth: 3,
    borderLeftColor: themeColors.primaryLight,
  },
  miniSessionDone: {
    opacity: 0.5,
    backgroundColor: themeColors.borderLight,
    borderLeftColor: themeColors.textMuted,
  },
  miniSessionText: {
    fontSize: 8,
    color: themeColors.textTitle,
    fontWeight: "500",
  },
  miniSessionMeta: {
    fontSize: 7,
    color: themeColors.textMuted,
  },

  // --- Pomodoro Screen ---
  timerPanel: {
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  
  timerPanelPausa: {
    backgroundColor: themeColors.badgeLowBg,
  },
  
  timerModePausa: {
    color: themeColors.badgeLowText,
  },
  primaryButtonPausa: {
    backgroundColor: themeColors.badgeLowText,
  },
  primaryButtonTextPausa: {
    color: themeColors.badgeLowBg,
  },
  secondaryButtonPausa: {
    backgroundColor: themeColors.badgeLowText,
    opacity: 0.65, 
  },
  secondaryButtonTextPausa: {
    color: themeColors.badgeLowBg, 
  },
  timerMode: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    color: themeColors.textTitle,
    fontVariant: ["tabular-nums"],
    marginVertical: 10,
  },

  // --- Modali e Fogli di Dettaglio ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: themeColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: themeColors.textTitle,
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalCloseIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeColors.textTitle,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
    backgroundColor: themeColors.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: themeColors.dangerBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textTitle,
    textAlign: "center",
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: themeColors.textBody,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  confirmWarningContainer: {
    backgroundColor: themeColors.dangerBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: themeColors.dangerText + "30",
  },
  confirmWarningText: {
    fontSize: 12,
    color: themeColors.dangerText,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmButtonCancel: {
    flex: 1,
    backgroundColor: themeColors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonCancelText: {
    color: themeColors.textBody,
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButtonDelete: {
    flex: 1,
    backgroundColor: themeColors.dangerText,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDeleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 100 : 90,
    flexDirection: "column",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: themeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 99,
  },
  fabActive: {
    backgroundColor: themeColors.primaryLight,
    borderWidth: 2,
    borderColor: themeColors.textOnPrimary,
  },
  fabText: {
    color: themeColors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 10,
  },
});