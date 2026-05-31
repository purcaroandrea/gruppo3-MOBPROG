import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useStyles } from "../../hooks/useStyles";

/**
 * SearchBar con pannello filtri espandibile.
 *
 * Props:
 *   value          – testo della query
 *   onChangeText   – handler di modifica testo
 *   placeholder    – placeholder dell'input
 *   filtersActive  – boolean: almeno un filtro è attivo (→ badge sul bottone)
 *   children       – contenuto del pannello filtri espandibile
 *   onClearFilters – callback per azzerare tutti i filtri (opzionale)
 *   noFilters      – se true, non mostra il bottone filtri
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  filtersActive = false,
  onClearFilters,
  noFilters = false,
  children,
}) {
  const { styles, themeColors: tc } = useStyles();
  const [open, setOpen] = React.useState(false);

  const hasFilters = Boolean(children) && !noFilters;

  return (
    <View style={{ marginBottom: 14 }}>
      {/* Riga input + bottone filtri */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* Input di ricerca */}
        <View style={{ flex: 1, position: "relative", justifyContent: "center" }}>
          <MaterialIcons
            name="search"
            size={20}
            color={tc.textMuted}
            style={{ position: "absolute", left: 12, zIndex: 1 }}
          />
          <TextInput
            style={[
              styles.input,
              { paddingLeft: 40, paddingRight: value ? 40 : 14, marginBottom: 0 },
            ]}
            autoCapitalize="none"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={tc.textMuted}
          />
          {Boolean(value) && (
            <Pressable
              style={{ position: "absolute", right: 12, padding: 4 }}
              onPress={() => onChangeText && onChangeText("")}
            >
              <MaterialIcons name="close" size={18} color={tc.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Bottone filtri */}
        {hasFilters && (
          <Pressable
            onPress={() => setOpen((o) => !o)}
            style={[
              styles.secondaryButton,
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingVertical: 10,
                paddingHorizontal: 13,
                position: "relative",
              },
              (open || filtersActive) && { backgroundColor: tc.primary },
            ]}
          >
            <MaterialIcons
              name="tune"
              size={18}
              color={(open || filtersActive) ? tc.textOnPrimary : tc.textBody}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                { fontSize: 13 },
                (open || filtersActive) && { color: tc.textOnPrimary },
              ]}
            >
              Filtri
            </Text>
            {/* Badge punto rosso quando filtri attivi e pannello chiuso */}
            {filtersActive && !open && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#ef4444",
                  borderWidth: 1.5,
                  borderColor: tc.bg || "#fff",
                }}
              />
            )}
          </Pressable>
        )}
      </View>

      {/* Pannello filtri espandibile */}
      {hasFilters && open && (
        <View
          style={[
            styles.card,
            {
              marginTop: 8,
              marginBottom: 0,
              gap: 12,
              borderWidth: 1.5,
              borderColor: tc.primary + "40",
            },
          ]}
        >
          {children}

          {/* Riga inferiore: badge filtri attivi + pulsante reset */}
          {(filtersActive || onClearFilters) && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {filtersActive ? (
                <Text style={{ fontSize: 12, color: tc.primary, fontWeight: "700" }}>
                  ● Filtri attivi
                </Text>
              ) : (
                <View />
              )}
              {filtersActive && onClearFilters && (
                <Pressable
                  onPress={() => { onClearFilters(); }}
                  style={[
                    styles.secondaryButton,
                    { paddingVertical: 6, paddingHorizontal: 12 },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { fontSize: 12 }]}>
                    Azzera filtri
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
