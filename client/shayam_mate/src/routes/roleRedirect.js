// Admin and Staff share one console; Client gets its own portal.
export const homePathForRole = (role) => (role === "client" ? "/client" : "/admin");
