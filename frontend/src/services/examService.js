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

export const getExams = async () => requestJson("/api/candidate/exams", { method: "GET" });

export const getTodaySSCExams = async () => requestJson("/api/candidate/exams/today-ssc", { method: "GET" });

export const getExamById = async (id) => requestJson(`/api/candidate/exams/${id}`, { method: "GET" });

/** Returns array of { board, count, last_scraped } */
export const getBoards = async () => requestJson("/api/candidate/boards", { method: "GET" });

/** Returns paginated notifications for a board */
export const getExamsByBoard = async (board, page = 1, limit = 20, category = null) => {
  let url = `/api/candidate/exams/board/${encodeURIComponent(board)}?page=${page}&limit=${limit}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  return requestJson(url, { method: "GET" });
};
