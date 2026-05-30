import { useContext, useMemo } from "react";
import { ThemeContext } from "../src/contexts/themeContext";
import { colors } from "../src/styles/colors";
import { getStyles } from "../src/styles/styles";

export function useStyles() {
  const { activeTheme } = useContext(ThemeContext);
  
  const themeColors = colors[activeTheme] || colors.light;
  const styles = useMemo(() => getStyles(themeColors), [themeColors]);

  return { styles, themeColors };
}