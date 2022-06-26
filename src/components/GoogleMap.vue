<template>
  <v-container>
    <v-layout>
      <v-flex>
        <div
          v-if="
            pageName == 'Occupation' ||
            pageName == 'Birth' ||
            pageName == 'Birth_Previous' ||
            pageName == 'manageAddresses'
          "
        ></div>
        <div
          v-if="
            pageName == 'Occupation' ||
            pageName == 'Birth' ||
            pageName == 'Birth_Previous' ||
            pageName == 'manageAddresses'
          "
        >
          <div class="p-relative">
            <GmapAutocomplete
              class="map-search"
              @place_changed="setPlace"
              :options="googleMapFields"
            ></GmapAutocomplete>
            <button
              class="set-current-loction"
              @click.prevent="getCurrentLocation()"
            >
              <img src="../assets/images/set-location.png" alt="" />
            </button>
          </div>
        </div>
        <GmapMap
          id="map"
          v-if="gps_x != null && gps_y != null"
          :zoom="customZoom"
          :center="center"
          :options="options"
          ref="map"
        >
          <GmapMarker
            ref="mapMarker"
            :position="{ lat: lastLat, lng: lastLng }"
            icon="https://raw.githubusercontent.com/shehabs010/kmmrce/main/ksa-pin.svg"
          />
          <!-- :editable="true" @paths_changed="updateEdited($event)" -->
        </GmapMap>

        <GmapMap
          id="map"
          v-else
          :zoom="customZoom"
          :center="center"
          :options="options"
          ref="map"
          @click="clicked"
        >
          <GmapMarker
            v-if="marker"
            :position="marker.latLng"
            icon="https://raw.githubusercontent.com/shehabs010/kmmrce/main/ksa-pin.svg"
          />
          <GmapMarker
            ref="mapMarker"
            v-else-if="lastLat"
            :position="{ lat: lastLat, lng: lastLng }"
            icon="https://raw.githubusercontent.com/shehabs010/kmmrce/main/ksa-pin.svg"
          />
        </GmapMap>
      </v-flex>
    </v-layout>

    <div
      v-if="
        pageName == 'Occupation' ||
        pageName == 'Birth' ||
        pageName == 'Birth_Previous' ||
        pageName == 'manageAddresses'
      "
    >
      <v-row
        v-if="
          pageName == 'Occupation' &&
          $store.state.userData.selectedUser.work_location_x &&
          marker == null
        "
        class="mt-3"
      >
        <v-col cols>
          <v-text-field
            class="text-field centered-input"
            outlined
            :value="placeDetail"
            label=" "
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row
        v-else-if="
          pageName == 'Birth' &&
          $store.state.userData.selectedUser.place_stay_x &&
          marker == null
        "
        class="mt-3"
      >
        <v-col cols>
          <v-text-field
            class="text-field centered-input"
            outlined
            :value="placeDetail"
            label=" "
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row
        v-else-if="
          pageName == 'Birth_Previous' &&
          $store.state.userData.selectedUser.place_stay_previous_x &&
          marker == null
        "
        class="mt-3"
      >
        <v-col cols>
          <v-text-field
            class="text-field centered-input"
            outlined
            :value="placeDetail"
            label=" "
            readonly
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row v-else-if="marker">
        <v-col cols>
          <v-text-field
            class="text-field centered-input"
            outlined
            :value="placeDetail"
            label=" "
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
var isInSide = false;

import { bus } from "@/main.js";
import { gmapApi } from "vue2-google-maps";
import axios from "axios";
export default {
  name: "GoogleMap",
  props: {
    gps__x: String,
    gps__y: String,
    pageName: String,
    loadPoly: String,
    occData: Object,
  },

  data() {
    return {
      isCreared: false,
      lastLocation: null,
      map: {},
      gps_x: null,
      gps_y: null,
      marker: null,
      lastLat: null,
      lastLng: null,
      center: { lat: 24.7439529, lng: 46.7493597 },
      currentPlace: null,
      markers: [],
      places: [],
      vMap: null,
      textForSearch: null,
      SearchedPlace: null,
      placeDetail: null,
      paths: [],
      polygons: [],
      feedLoaded: false,
      options: {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        disableDefaultUi: false,
      },
      customZoom: 9,
      mapTypeId: "styledMapType",
      locations: [],
      googleMapFields: { fields: ["name", "place_id", "geometry"] },
      infoWindow: null,
    };
  },
  mounted: function () {
    switch (this.pageName) {
      case "Occupation":
        if (
          this.$store.state.userData.selectedUser.work_location_x &&
          this.$store.state.userData.selectedUser.work_location_y
        ) {
          this.lastLat = parseFloat(
            this.$store.state.userData.selectedUser.work_location_x
          );
          this.lastLng = parseFloat(
            this.$store.state.userData.selectedUser.work_location_y
          );
          this.center.lat = this.lastLat;
          this.center.lng = this.lastLng;
        }
        break;
      case "profile":
        this.gps_x = parseFloat(this.gps__x);
        this.gps_y = parseFloat(this.gps__y);
        this.lastLat = this.gps_x;
        this.lastLng = this.gps_y;
        this.center.lat = this.lastLat;
        this.center.lng = this.lastLng;
        break;
      case "Birth":
        if (
          this.$store.state.userData.selectedUser.place_stay_x &&
          this.$store.state.userData.selectedUser.place_stay_y
        ) {
          this.lastLat = parseFloat(
            this.$store.state.userData.selectedUser.place_stay_x
          );
          this.lastLng = parseFloat(
            this.$store.state.userData.selectedUser.place_stay_y
          );
          this.center.lat = this.lastLat;
          this.center.lng = this.lastLng;
        }
        break;
      case "Birth_Previous":
        if (
          this.$store.state.userData.selectedUser.place_stay_previous_x &&
          this.$store.state.userData.selectedUser.place_stay_previous_y
        ) {
          this.lastLat = parseFloat(
            this.$store.state.userData.selectedUser.place_stay_previous_x
          );
          this.lastLng = parseFloat(
            this.$store.state.userData.selectedUser.place_stay_previous_y
          );
          this.center.lat = this.lastLat;
          this.center.lng = this.lastLng;
        }
        break;
    }
    this.getpalceData();
  },
  methods: {
    getpalceData(lat, lng) {
      this.$nextTick(() => {
        this.$refs.map.$mapPromise.then((map) => {
          const _googleApiGeocoder = new google.maps.Geocoder();
          _googleApiGeocoder.geocode(
            {
              location: {
                lat: this.lastLat,
                lng: this.lastLng,
              },
            },
            (results_, status_) => {
              if (status_ !== google.maps.GeocoderStatus.OK) {
                // error process here
                console.log("error process here");
              } else {
                // success process here
                this.placeDetail = results_[0].formatted_address; //for del & fix
              }
            }
          );
        });
      });
    },
    drawPolygon() {
      this.$nextTick(() => {
        this.$refs.map.$mapPromise.then((map) => {
          // Load GeoJSON
          //  (this.loadPoly == "true" && !this.isDrawed) ||
          // (this.loadPoly == null && !this.isDrawed)
          if (this.loadPoly == "true" || this.loadPoly == null) {
            // if (this.$store.state.places.loadPoly) {
            //   const state = map.data.loadGeoJson(
            //     "https://raw.githubusercontent.com/shehabs010/kmmrce/main/_KSA_Bounderies.geojson"
            //   );
            // }
            const state = map.data.loadGeoJson(
              "https://raw.githubusercontent.com/shehabs010/kmmrce/main/_KSA_Bounderies.geojson"
            );
            map.data.setStyle({
              fillColor: "transparent",
              strokeColor: "green",
              strokeWeight: 2,
              clickable: false,
            });

            // if (this.$store.state.places.loadPoly == false) {
            //   this.readGeoJson();
            // }
            this.readGeoJson();
          } else {
            return false;
          }
        });
      });
    },
    clicked(e) {
      const location = {
        lat: parseFloat(e.latLng.lat()),
        lng: parseFloat(e.latLng.lng()),
      };

      this.checkCoordinatesWithinLocation(e.latLng);

      // eslint-disable-next-line no-undef
      const _googleApiGeocoder = new google.maps.Geocoder();

      _googleApiGeocoder.geocode({ location }, (results, status) => {
        // eslint-disable-next-line no-undef
        if (isInSide) {
          if (status == google.maps.GeocoderStatus.OK) {
            // success process here
            this.lastLocation = location;
            this.placeDetail = results[0].formatted_address; //for del & fix
          } else {
            // error process here
            console.log("someThing went Wrong", status); //comment
          }
        } else {
          this.marker = {
            latLng: this.lastLocation,
          };
          // this.$store.dispatch("showSweetAlert", {
          //   msg: this.$t("wrongSweetAlert"),
          //   icon: "error",
          //   setTimer: true,
          //   setProgressBar: false,
          // });
        }
      });
      if (e.placeId) {
        _googleApiGeocoder.geocode(
          { placeId: e.placeId },
          (results, status) => {
            this.placeDetail = results[0].formatted_address;
          }
        );
      }

      if (!this.marker) {
        this.marker = {
          latLng: e.latLng,
          icon: "https://raw.githubusercontent.com/shehabs010/kmmrce/main/assets/imgs/ksa.png",
        };
      } else {
        this.marker = {
          latLng: e.latLng,
          icon: "https://raw.githubusercontent.com/shehabs010/kmmrce/main/assets/imgs/ksa.png",
        };
      }
      this.lastLat = e.latLng.lat();
      this.lastLng = e.latLng.lng();

      if (this.pageName == "Occupation") {
        this.$emit(
          "WORK_LOCATION_X_Y_Parameter",
          this.lastLat,
          this.lastLng,
          e.placeId
        );
        bus.$emit(
          "WORK_LOCATION_X_Y_Parameter",
          this.lastLat,
          this.lastLng,
          e.placeId
        );
      } else if (this.pageName == "manageAddresses") {
        this.$emit(
          "NO_BARCODE_RESIDENCE_LOCATION_X_Y_Parameter",
          this.lastLat,
          this.lastLng
        );
      } else {
        this.$emit(
          "CURRENT_RESIDENCE_LOCATION_X_Y_Parameter",
          this.lastLat,
          this.lastLng
        );
      }
    },

    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            this.marker = {
              latLng: pos,
            };
            this.lastLat = position.coords.latitude;
            this.lastLng = position.coords.longitude;
            this.center.lat = this.lastLat;
            this.center.lng = this.lastLng;
            const _googleApiGeocoder = new google.maps.Geocoder();
            _googleApiGeocoder.geocode(
              {
                location: {
                  lat: this.lastLat,
                  lng: this.lastLng,
                },
              },
              (results_, status_) => {
                if (status_ !== google.maps.GeocoderStatus.OK) {
                  // error process here
                  console.log("error process here");
                } else {
                  // success process here
                  // console.log("success process here", results_);
                  this.placeDetail = results_[0].formatted_address; //for del & fix
                }
              }
            );
            switch (this.pageName) {
              case "Occupation":
                this.$emit(
                  "WORK_LOCATION_X_Y_Parameter",
                  this.lastLat,
                  this.lastLng
                );
                break;
              case "profile":
                break;
              case "Birth":
                this.$emit(
                  "CURRENT_RESIDENCE_LOCATION_X_Y_Parameter",
                  this.lastLat,
                  this.lastLng
                );
                break;
              case "Birth_Previous":
                this.$emit(
                  "CURRENT_RESIDENCE_LOCATION_X_Y_Parameter",
                  this.lastLat,
                  this.lastLng
                );
                break;
              case "manageAddresses":
                this.$emit(
                  "NO_BARCODE_RESIDENCE_LOCATION_X_Y_Parameter",
                  this.lastLat,
                  this.lastLng
                );
                break;
            }
          },
          (error) => {
            alert(error.message);
          }
        );
      } else {
        console.log("error in Current Location");
        this.$store.dispatch("showSweetAlert", {
          msg: this.$t("wrongSweetAlert"),
          icon: "error",
          setTimer: true,
          setProgressBar: false,
        });
      }
    },

    checkCoordinatesWithinLocation(location) {
      isInSide = false;
      // file of paths that responsable for draw border of ksa is has mulit polygons
      // so we have to take it one by one
      this.polygons.forEach((singlePoly) => {
        if (
          // eslint-disable-next-line no-undef
          google.maps.geometry &&
          google.maps.geometry.poly.containsLocation(
            // eslint-disable-next-line no-undef
            new google.maps.LatLng(location),
            singlePoly
          )
        ) {
          isInSide = true;
        }
      });
    },
    setPlace(place) {
      this.SearchedPlace = place;
      this.checkCoordinatesWithinLocation(place.geometry.location);
      if (isInSide) {
        this.marker = {
          latLng: place.geometry.location,
        };
        this.lastLat = this.marker.latLng.lat();
        this.lastLng = this.marker.latLng.lng();
        this.center.lat = this.lastLat;
        this.center.lng = this.lastLng;
        this.placeDetail =
          place.name +
          (place.formatted_address ? " - " + place.formatted_address : ""); // display name and sull address
        debugger;
        if (this.pageName == "manageAddresses") {
          this.$emit(
            "NO_BARCODE_RESIDENCE_LOCATION_X_Y_Parameter",
            this.lastLat,
            this.lastLng
          );
        } else {
          this.$emit("WORK_LOCATION_X_Y_Parameter", this.lastLat, this.lastLng);
        }
      } else {
        console.log("sorry this location out of Country");
        this.$store.dispatch("showSweetAlert", {
          msg: this.$t("wrongSweetAlert"),
          icon: "error",
          setTimer: true,
          setProgressBar: false,
        });
      }

      // this.placeDetails(place);
    },
    async readGeoJson() {
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/shehabs010/kmmrce/main/_KSA_Bounderies.geojson"
      );

      // await this.$localStorage.set("drawPoly", JSON.stringify(true));
      this.paths = data.features[0].geometry.coordinates;
    },
    convertMultiToSinglePoly() {
      this.paths.forEach((levelOne) => {
        let polyLevelOne = [];
        levelOne.forEach((levelTwo) => {
          levelTwo.forEach((point) => {
            polyLevelOne.push({ lat: point[1], lng: point[0] });
          });
        });
        // eslint-disable-next-line no-undef
        this.polygons.push(new google.maps.Polygon({ paths: polyLevelOne }));
      });
    },
  },
  computed: {
    google() {
      return gmapApi;
    },
  },
  created: function () {
    // i added it to check if it draw the borders before or not

    this.drawPolygon();
  },
  watch: {
    feedLoaded: function () {
      if (this.feedLoaded == true) {
        var LocationList = this.locations;

        for (var i = 0; i < LocationList.length; i++) {
          var includeOnMap = LocationList[i].acf["place_include-on-map"];

          if (includeOnMap === true) {
            var placeName = LocationList[i].title.rendered;
            var placeDescription =
              LocationList[i].acf["place_short-description"];
            var placeLatitude = LocationList[i].acf["place_latitude"];
            var placeLongitude = LocationList[i].acf["place_longitude"];
            // var placeIcon = this.mapIconDestination;
            this.markers.push({
              name: placeName,
              lat: placeLatitude,
              lng: placeLongitude,
            });
          }
        }
      }
    },
    paths() {
      this.convertMultiToSinglePoly();
    },
  },
};
</script>
