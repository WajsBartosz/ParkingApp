import ky from "ky";

const backendUrl = "https://parking-app-backend.azurewebsites.net";

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
