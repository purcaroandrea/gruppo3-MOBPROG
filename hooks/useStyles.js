import { useContext, useMemo } from "react";
// Importiamo il Context che abbiamo appena creato!
import { ThemeContext } from "../src/contexts/ThemeContext";
import { colors } from "../src/styles/colors";
import { getStyles } from "../src/styles/styles";

export function useStyles() {
  // Ora leggiamo "activeTheme" dal nostro cervello centrale
  const { activeTheme } = useContext(ThemeContext);
  
  const themeColors = colors[activeTheme] || colors.light;
  const styles = useMemo(() => getStyles(themeColors), [themeColors]);

  return { styles, themeColors };
}