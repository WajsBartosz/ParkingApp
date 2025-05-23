import ky from "ky";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

console.log("Backend URL:", backendUrl);

const api = ky.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        const token = window.localStorage.getItem("token");

        if (!token) {
          return;
        }

        request.headers.set("Authorization", `Bearer ${token}`);
      },
    ],
  },
  prefixUrl: backendUrl,
});

export default api;
