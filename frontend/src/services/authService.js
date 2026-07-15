const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const requestJson = async (path, payload) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

export const registerCandidate = async (payload) => requestJson("/api/candidate/register", payload);

export const loginCandidate = async (payload) => requestJson("/api/candidate/login", payload);

export const forgotPassword = async (payload) => requestJson("/api/candidate/forgot-password", payload);

export const resetPassword = async (payload) => requestJson("/api/candidate/reset-password", payload);
