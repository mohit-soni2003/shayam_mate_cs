import { create } from "zustand";
import { getMyEntitiesRequest } from "../services/entityService";

// Single source of truth for "which entity is the client currently looking
// at" — feeds the sidebar switcher (spec Section 7) and every client page
// that needs to scope its data to one entity (Compliance, Documents, ...).
export const useEntityStore = create((set, get) => ({
  entities: [],
  selectedEntityId: null,
  isLoading: true,
  error: null,

  fetchEntities: async () => {
    try {
      const entities = await getMyEntitiesRequest();
      const { selectedEntityId } = get();
      const stillValid = entities.some((e) => e.id === selectedEntityId);
      set({
        entities,
        selectedEntityId: stillValid ? selectedEntityId : entities[0]?.id || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load entities", isLoading: false });
    }
  },

  selectEntity: (id) => set({ selectedEntityId: id }),
}));
