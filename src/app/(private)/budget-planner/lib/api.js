const handleRes = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  const json = contentType.includes("application/json") ? await res.json() : null;
  if (!res.ok) {
    const message = (json && json.message) || res.statusText || "API error";
    const err = new Error(message);
    err.json = json;
    throw err;
  }
  return json;
};

const api = {
  get: async (url) => {
    const res = await fetch(url, { credentials: "same-origin" });
    return handleRes(res);
  },
  post: async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return handleRes(res);
  },
  put: async (url, body) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return handleRes(res);
  },
  delete: async (url) => {
    const res = await fetch(url, { method: "DELETE", credentials: "same-origin" });
    return handleRes(res);
  },
};

export default api;