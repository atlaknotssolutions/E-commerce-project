/**
 * Bounded in-memory per-user shopping conversation context.
 *
 * Keeps the assistant's most recent shopping episode per session key:
 * the raw query, parsed constraints, ranked result ids, whether the last
 * attempt found results, and a short follow-up history. Everything is keyed
 * by an explicit session key (authenticated userId OR an isolated guest key)
 * so no context ever leaks across users or guests.
 *
 * Pure state container — no I/O. Evicts the oldest session when the cap is
 * reached, mirroring the existing conversation/search-context stores.
 */
export const createShoppingContextStore = ({ maxSessions = 1000 } = {}) => {
  const store = new Map();
  const MAX = Math.max(1, Math.floor(maxSessions));

  const get = (sessionKey) => {
    if (typeof sessionKey !== "string" || !sessionKey) return null;
    return store.get(sessionKey) || null;
  };

  const save = (sessionKey, state = {}) => {
    if (typeof sessionKey !== "string" || !sessionKey) return;

    if (store.size >= MAX && !store.has(sessionKey)) {
      const oldest = store.keys().next().value;
      store.delete(oldest);
    }

    store.set(sessionKey, {
      lastQuery: typeof state.lastQuery === "string" ? state.lastQuery : "",
      constraints: state.constraints && typeof state.constraints === "object"
        ? state.constraints
        : {},
      resultIds: Array.isArray(state.resultIds) ? state.resultIds : [],
      rankMap: state.rankMap && typeof state.rankMap === "object" ? state.rankMap : {},
      shownIds: Array.isArray(state.shownIds) ? state.shownIds : [],
      selectedProductId:
        typeof state.selectedProductId === "string" ? state.selectedProductId : null,
      found: Boolean(state.found),
      intent: typeof state.intent === "string" ? state.intent : "search",
      history: Array.isArray(state.history)
        ? state.history.slice(-8)
        : [],
    });
  };

  const pushHistory = (sessionKey, entry = {}) => {
    const state = get(sessionKey);
    const history = Array.isArray(state?.history) ? state.history : [];
    history.push({
      query: typeof entry.query === "string" ? entry.query : "",
      resultIds: Array.isArray(entry.resultIds) ? entry.resultIds : [],
    });
    save(sessionKey, {
      ...(state || {}),
      history,
    });
  };

  const clear = (sessionKey) => {
    if (typeof sessionKey === "string" && sessionKey) {
      store.delete(sessionKey);
    }
  };

  const size = () => store.size;

  return Object.freeze({
    get,
    save,
    pushHistory,
    clear,
    size,
  });
};