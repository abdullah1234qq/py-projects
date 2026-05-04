import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

function detect() {
  const { width } = Dimensions.get("window");
  return Platform.OS !== "web" && width < 760 ? "mobile" : "desktop";
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState(detect);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => setDeviceType(detect()));
    return () => subscription?.remove();
  }, []);

  return deviceType;
}
