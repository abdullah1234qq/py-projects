import { useEffect, useState } from "react";

function detectDevice() {
  if (typeof window === "undefined") {
    return "desktop";
  }
  const mobileAgent = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  return mobileAgent || window.innerWidth < 760 ? "mobile" : "desktop";
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState(detectDevice);

  useEffect(() => {
    const onResize = () => setDeviceType(detectDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return deviceType;
}
