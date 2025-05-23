import ky from "ky";

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
  prefixUrl: "http://127.0.0.1:8000",
});

export default api;
