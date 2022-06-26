import axios from "axios";
var headerData = {
  "Content-Type": "application/json",
};
export function getAdmin2() {
  return axios.get(
    "https://apptest.stats.gov.sa/api/geo/self/admins",
    headerData
  );
}
export function getRegion2(id) {
  return axios.get(
    "https://apptest.stats.gov.sa/api/geo/self/" + id + "/regions",
    headerData
  );
}
export function getPlaces(id) {
  return axios.get(
    "https://apptest.stats.gov.sa/api/geo/self/regions/" + id + "/places",
    headerData
  );
}
export function getHaras(id) {
  return axios.get(
    "https://apptest.stats.gov.sa/api/geo/self/" + id + "/haras",
    headerData
  );
}
