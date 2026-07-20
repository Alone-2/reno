import { create } from "zustand";
import { MOCK_PROJECT_A_ID } from "@/mocks/project-overview";

interface ProjectSessionState {
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
}

export const useProjectSession = create<ProjectSessionState>((set) => ({
  currentProjectId: MOCK_PROJECT_A_ID,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
