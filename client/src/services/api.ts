const API_URL = "http://localhost:4000/api";

export async function request(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}
