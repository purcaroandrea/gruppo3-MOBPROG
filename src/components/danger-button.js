import React, { useState } from "react";
import { Pressable, Text, Modal, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useStyles } from "../../hooks/useStyles";

export default function DangerButton({
  onPress,
  itemName = "",
  itemType = "elemento",
  warningMessage = "",
  extraWarning = "",
}) {
  const { styles, themeColors } = useStyles();
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirm = () => {
    setModalVisible(false);
    onPress();
  };

  return (
    <>
      <Pressable style={styles.dangerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dangerButtonText}>Elimina</Text>
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
              <MaterialIcons name="delete-forever" size={32} color={themeColors.dangerText} />
            </View>

            <Text style={styles.confirmTitle}>Conferma eliminazione</Text>
            
            <Text style={styles.confirmMessage}>
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
                <Text style={styles.confirmButtonDeleteText}>Elimina</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}