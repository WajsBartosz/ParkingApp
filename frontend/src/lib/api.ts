import ky from "ky";

const api = ky.extend({ prefixUrl: "http://127.0.0.1:80" });

export default api;
