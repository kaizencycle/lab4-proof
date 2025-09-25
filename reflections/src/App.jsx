import ReflectionsPage from "./ReflectionsPage";

function App() {
  return <ReflectionsPage />;
}

export default App;

import { useState, useEffect } from "react";
import ReflectionsPage from "./ReflectionsPage";
import UnlockPage from "./UnlockPage";
import { introspectToken } from "./api";

function App() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    introspectToken(token).then((info) => {
      if (info.ok) setUnlocked(true);
    });
  }, []);

  if (!unlocked) {
    return <UnlockPage onUnlock={() => setUnlocked(true)} />;
  }

  return <ReflectionsPage />;
}

export default App;
