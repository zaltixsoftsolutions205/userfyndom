import ApiClient from "./ApiClient";

export const HostelMapService = {
  getAllForMap: () =>
    ApiClient.get("/api/public/hostels/map"),

  searchHostels: (query: string) =>
    ApiClient.get(`/api/public/hostels/search?q=${query}`),

  getNearby: (lat: number, lng: number, radius = 5) =>
    ApiClient.get(
      `/api/public/hostels/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  getSingleLocation: (hostelId: string) =>
    ApiClient.get(`/api/public/hostels/location/${hostelId}`),
};
