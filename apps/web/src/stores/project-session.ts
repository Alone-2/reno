import { create } from "zustand";
interface ProjectSessionState {
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
}

export const useProjectSession = create<ProjectSessionState>((set) => ({
  currentProjectId: "",
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
