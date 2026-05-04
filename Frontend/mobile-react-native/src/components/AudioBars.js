import React from "react";
import { View } from "react-native";

import { theme } from "../theme";

export function AudioBars({ tone = "cyan", count = 34 }) {
  return (
    <View style={styles.bars}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: 8 + ((index * 19) % 36),
              backgroundColor: tone === "green" ? theme.colors.green : theme.colors.cyan
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = {
  bars: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  bar: {
    width: 3,
    borderRadius: 6
  }
};
