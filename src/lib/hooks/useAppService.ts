import { useState, useEffect } from "react";

export function useAppService() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Access window only after component mounts (client-side)
    setIsReady(window.appService?.initialized ?? false);

    if (!window.appService?.initialized) {
      window.executeWhenReady(() => setIsReady(true));
    }
  }, []);

  return {
    appService: typeof window !== "undefined" ? window.appService : null,
    isReady,
  };
}
