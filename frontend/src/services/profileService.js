const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("govt_exam_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { message: text || "Request failed" };
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getProfile = async () => requestJson("/api/candidate/profile", { method: "GET" });

export const updateProfile = async (payload) => requestJson("/api/candidate/profile", {
  method: "PUT",
  body: JSON.stringify(payload),
});
