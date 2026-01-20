import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { SDKConfig } from "../types";

import { createOCRBaseClient, type OCRBaseClient } from "../client";

interface OCRBaseContextValue {
  client: OCRBaseClient;
  config: SDKConfig;
}

const OCRBaseContext = createContext<OCRBaseContextValue | null>(null);

export interface OCRBaseProviderProps {
  children: ReactNode;
  config: SDKConfig;
}

export const OCRBaseProvider = ({
  children,
  config,
}: OCRBaseProviderProps): ReactNode => {
  const value = useMemo(
    () => ({
      client: createOCRBaseClient(config),
      config,
    }),
    [config]
  );

  return (
    <OCRBaseContext.Provider value={value}>{children}</OCRBaseContext.Provider>
  );
};

export const useOCRBaseClient = (): OCRBaseClient => {
  const context = useContext(OCRBaseContext);

  if (!context) {
    throw new Error("useOCRBaseClient must be used within an OCRBaseProvider");
  }

  return context.client;
};

export const useOCRBaseConfig = (): SDKConfig => {
  const context = useContext(OCRBaseContext);

  if (!context) {
    throw new Error("useOCRBaseConfig must be used within an OCRBaseProvider");
  }

  return context.config;
};
