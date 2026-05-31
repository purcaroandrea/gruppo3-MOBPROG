import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useStyles } from "../../hooks/useStyles";

/**
 * Bottone filtro con menu a tendina.
 *
 * Props:
 *   label    – testo del bottone quando nessun valore è attivo
 *   value    – valore selezionato corrente
 *   options  – array di valori (il primo è considerato "nessun filtro")
 *   labels   – mappa { value: labelVisualizzata } opzionale
 *   onChange – callback(newValue)
 */
export default function DropdownFilter({ label, value, options, labels, onChange }) {
  const { themeColors: tc } = useStyles();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0, width: 0 });
  const btnRef = React.useRef(null);

  // Il primo elemento di options è il valore "neutro" (Tutti / Tutte / "")
  const isActive = value !== options[0];
  const displayVal = labels ? (labels[value] ?? value) : value;

  const handleOpen = () => {
    btnRef.current?.measureInWindow((x, y, width, height) => {
      setPos({ x, y: y + height + 4, width: Math.max(width, 180) });
      setOpen(true);
    });
  };

  const bg     = isActive ? tc.primary : tc.card;
  const border = isActive ? tc.primary : tc.borderDark;
  const color  = isActive ? tc.textOnPrimary : tc.textBody;

  return (
    <>
      <Pressable
        ref={btnRef}
        onPress={handleOpen}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 8,
          paddingHorizontal: 13,
          borderRadius: 20,
          backgroundColor: bg,
          borderWidth: 1.5,
          borderColor: border,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color }}>
          {isActive ? displayVal : label}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={17} color={color} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop: chiude il menu al tocco esterno */}
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          {/* Dropdown posizionato sotto il bottone */}
          <View
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              minWidth: pos.width,
              backgroundColor: tc.card,
              borderRadius: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 18,
              elevation: 16,
              borderWidth: 1,
              borderColor: tc.borderDark,
              overflow: "hidden",
            }}
          >
            <ScrollView bounces={false} style={{ maxHeight: 320 }}>
              {options.map((opt, i) => {
                const optLabel = labels ? (labels[opt] ?? opt) : opt;
                const selected = value === opt;
                return (
                  <Pressable
                    key={String(opt)}
                    onPress={() => { onChange(opt); setOpen(false); }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: selected ? tc.primary + "16" : "transparent",
                      borderBottomWidth: i < options.length - 1 ? 1 : 0,
                      borderBottomColor: tc.borderDark + "55",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: selected ? "700" : "400",
                        color: selected ? tc.primary : tc.textBody,
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {optLabel}
                    </Text>
                    {selected && (
                      <MaterialIcons name="check" size={16} color={tc.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
