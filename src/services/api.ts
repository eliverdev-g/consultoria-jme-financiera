export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("jme_token");
  const baseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401 && path !== "/auth/login") {
    sessionStorage.removeItem("jme_token");
    window.dispatchEvent(new Event("jme:unauthorized"));
  }
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "El servicio no está disponible" }));
    throw new Error(error.message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
