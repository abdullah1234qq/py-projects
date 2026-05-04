import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "voice2pdf.username";

export function useStoredName() {
  const [username, setUsername] = useState("Student");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((value) => {
      if (value) {
        setUsername(value);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY, username || "Student");
  }, [username]);

  return [username, setUsername];
}
