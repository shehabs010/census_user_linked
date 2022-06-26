<template>
  <div class="box d-flex flex-column align-center justify-center">
    <v-container class="pa-0">
      <v-row>
        <v-col>
          <v-text-field
            outlined
            ref="fo"
            :label="$t('register-login.userName')"
            v-model="userData.nationalId"
            onKeyPress="if(this.value.length==10) return false;"
            prepend-inner-icon="icon-card-account-details-outline"
            class="text-field"
          ></v-text-field>
        </v-col>

        <v-col>
          <v-text-field
            v-if="$i18n.locale == 'ar'"
            suffix="00966"
            onKeyPress="if(this.value.length == 9) return false;"
            placeholder="5XXXXXXXX"
            class="text-field mt-3"
            v-model="userData.mobile"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="d-flex">
        <v-flex>
          <div class="mb-1 mt-5">
            <label class="font-black-bold-16">{{
              $t("AdministrativeRegion")
            }}</label>
            <v-autocomplete
              class="text-field mt-3"
              :placeholder="$t('MemberForm.PH-region')"
              outlined
              v-model="userData.adminId"
              item-value="LOOKUP_LIST_ID"
              item-text="NAME"
              required
            ></v-autocomplete>
          </div>
          <div class="mb-1">
            <label class="font-black-bold-16">{{ $t("Governorate") }}</label>
            <v-autocomplete
              class="text-field mt-3"
              :placeholder="$t('MemberForm.PH-governorate')"
              outlined
              v-model="userData.regionId"
              item-value="LOOKUP_LIST_ID"
              item-text="NAME"
              required
            ></v-autocomplete>
          </div>
          <div>
            <label class="font-black-bold-16">{{ $t("place") }}</label>
            <v-autocomplete
              class="text-field mt-3"
              outlined
              :items="ss"
              :placeholder="$t('MemberForm.PH-place')"
              v-model="placeId"
              item-value="placeID"
              item-text="placeName"
            ></v-autocomplete>
          </div>
          <div>
            <label class="font-black-bold-16">{{ $t("hara") }}</label>
            <v-autocomplete
              class="text-field mt-3"
              outlined
              :items="ss"
              :placeholder="$t('MemberForm.PH-hara')"
              v-model="haraId"
              item-value="haraID"
              item-text="haraName"
            ></v-autocomplete>
          </div>
        </v-flex>
      </v-row>
      <v-layout wrap>
        <v-flex sm12 xs12 class="mt-4">
          <GoogleMap
            class="map-form"
            ref="map"
            @NO_BARCODE_RESIDENCE_LOCATION_X_Y_Parameter="
              PREVIOUS_RESIDENCE_LOCATION_X_Y_Parameter
            "
            :pageName="'manageAddresses'"
          ></GoogleMap>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-form v-model="valid">
          <!-- first row -->

          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card-title
                  class="d-flex flex-column align-center justify-center"
                >
                  <label class="font-black-bold-20 mt-2">
                    {{ $t("manage-addresses.address-details") }}
                  </label>
                </v-card-title>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <label class="font-black-normal-14">{{
                  $t("Details.zip-code")
                }}</label
                ><span class="font-gray-normal-12 mx-1"
                  >({{ $t("MemberForm.optional") }})</span
                >
                <v-text-field
                  outlined
                  class="text-field"
                  v-model="userData.zipCode"
                  :label="$t('Details.zip-code')"
                  onKeyPress="if(this.value.length == 5) return false;"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <label class="font-black-normal-14">{{
                  $t("manage-addresses.national_address")
                }}</label
                ><span class="font-gray-normal-12 mx-1"
                  >({{ $t("MemberForm.optional") }})</span
                >
                <v-text-field
                  outlined
                  class="text-field"
                  v-model="userData.nationalAddress"
                  onKeyPress="if(this.value.length == 4) return false;"
                  :label="$t('manage-addresses.national_address')"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <label class="font-black-normal-14">{{
                  $t("Details.additional_address")
                }}</label
                ><span class="font-gray-normal-12 mx-1"
                  >({{ $t("MemberForm.optional") }})</span
                >
                <v-text-field
                  outlined
                  class="text-field"
                  v-model="userData.additionalAddress"
                  onKeyPress="if(this.value.length == 4) return false;"
                  :label="$t('Details.additional_address')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <label class="font-black-normal-14">{{
                  $t("manage-addresses.details-the-national-address")
                }}</label>
                <span class="mx-1 red--text">*</span>
                <v-text-field
                  outlined
                  class="text-field"
                  v-model="userData.addressNotes"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn block class="btn btn-primary" @click="sendDataManageAdd()">{{
              $t("confirmationMsgPopup")
            }}</v-btn>
          </v-container>
          <!-- second row -->

          <!-- third row -->
        </v-form>
      </v-layout>
    </v-container>
  </div>
</template>
<script>
import { getAdmin2 } from "../services";
export default {
  props: ["drawPoly"],
  data() {
    return {
      userData: {
        nationalId: 1234567899,
        countryMobileCode: "966",
        mobile: null,
        adminId: null,
        regionId: null,
        placeId: null,
        haraId: null,
        addressNotes: null,
        selfCensus: 0,
        isMapLocation: false,
        zipCode: null,
        nationalAddress: null,
        additionalAddress: null,
        longitude: null,
        latitude: null,
      },
      valid: null,
      rules: {
        min_QR: (v) => (v != null ? v.length >= 4 || "" : ""),
      },
    };
  },
  methods: {
    PREVIOUS_RESIDENCE_LOCATION_X_Y_Parameter(valueX, valueY) {
      this.userData.gpsLongitude = valueX.toString();
      this.userData.gpsLatitude = valueY.toString();
    },
    async sendDataManageAdd() {},
  },
  created() {
    getAdmin2();
  },
};
</script>
