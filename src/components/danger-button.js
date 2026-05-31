import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";

export default function DangerButton({
  onPress,
  itemName = "",
  itemType = "elemento",
  warningMessage = "",
  extraWarning = "",
  label = "Elimina",
  confirmLabel = "Elimina",
}) {
  const { styles, themeColors } = useStyles();
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirm = () => {
    setModalVisible(false);
    onPress();
  };

  const isReset = label === "Ripristina";

  return (
    <>
      <Pressable style={styles.dangerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dangerButtonText}>{label}</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconContainer}>
              <MaterialIcons
                name={isReset ? "settings-backup-restore" : "delete-forever"}
                size={32}
                color={themeColors.dangerText}
              />
            </View>

            <Text style={styles.confirmTitle}>
              {isReset ? "Conferma ripristino" : "Conferma eliminazione"}
            </Text>
            
            <Text style={styles.confirmMessage}>
              {isReset ? (
                <>
                  Sei sicuro di voler ripristinare il{" "}
                  <Text style={{ fontWeight: "700" }}>{itemType}</Text>?
                </>
              ) : (
                <>
                  Sei sicuro di voler eliminare questo{" "}
                  <Text style={{ fontWeight: "700" }}>{itemType}</Text>
                  {itemName ? (
                    <>
                      : <Text style={{ fontWeight: "700" }}>{itemName}</Text>
                    </>
                  ) : (
                    ""
                  )}
                  ?
                </>
              )}
            </Text>

            {warningMessage ? (
              <View style={styles.confirmWarningContainer}>
                <Text style={styles.confirmWarningText}>{warningMessage}</Text>
              </View>
            ) : null}

            {extraWarning ? (
              <View style={[styles.confirmWarningContainer, { backgroundColor: themeColors.dangerBg, marginTop: 8 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <MaterialIcons name="warning" size={16} color={themeColors.dangerText} />
                  <Text style={[styles.confirmWarningText, { color: themeColors.dangerText, fontWeight: "700" }]}>
                    {extraWarning}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.confirmButtonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.confirmButtonCancelText}>Annulla</Text>
              </Pressable>

              <Pressable style={styles.confirmButtonDelete} onPress={handleConfirm}>
                <Text style={styles.confirmButtonDeleteText}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}