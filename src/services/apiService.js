import axios from "axios";

const apiService = axios.create({
  baseURL: "http://softwaresolution.somee.com/api/v1",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    // console.log("token", token);
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI0NjYyNGYxNC05MWM5LTRiYTAtYmJmZC0xYWQ3ODIzZDg0NjgiLCJlbWFpbCI6ImVtcmFuQGdtYWlsLmNvbSIsInJvbGUiOiJTdXBlckJvc3MiLCJuYmYiOjE3NDY4NjQxMTMsImV4cCI6MTc0NzA0NDExMywiaWF0IjoxNzQ2ODY0MTEzLCJpc3MiOiJTb2Z0YmVleiIsImF1ZCI6IlNvZnRiZWV6Q2xpZW50In0.LS78_ww2L7EHwV-oF6rwrFUdko6UDQPg-Rrd13Rnj20";
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log("Unauthorized access");

          break;
        case 404:
          console.log("Resource not found");
          break;
        case 500:
          console.log("Server error");
          break;
        default:
          console.log("An error occurred");
      }
    } else if (error.request) {
      console.log("No response received");
    } else {
      console.log("Error", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiService;
