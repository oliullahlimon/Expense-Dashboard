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
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI0NjYyNGYxNC05MWM5LTRiYTAtYmJmZC0xYWQ3ODIzZDg0NjgiLCJlbWFpbCI6ImVtcmFuQGdtYWlsLmNvbSIsInJvbGUiOiJTdXBlckJvc3MiLCJuYmYiOjE3NDY5NDQ4NjIsImV4cCI6MTc0NzEyNDg2MiwiaWF0IjoxNzQ2OTQ0ODYyLCJpc3MiOiJTb2Z0YmVleiIsImF1ZCI6IlNvZnRiZWV6Q2xpZW50In0.iN-uDek9UvLuJKyb9ee9Lqvs-qmZ_DjZGjNv4UJZLTU";
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
