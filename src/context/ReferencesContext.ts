import { createContext, useContext } from "react";

// Map of citation number -> URL
type ReferencesMap = Record<number, string>;

export const ReferencesContext = createContext<ReferencesMap>({});

export function useReferences() {
    return useContext(ReferencesContext);
}
