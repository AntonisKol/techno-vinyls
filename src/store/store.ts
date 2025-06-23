import { configureStore } from "@reduxjs/toolkit";
import { releasesApi } from "../api/releasesApi";

export const store = configureStore({
  reducer: {
    [releasesApi.reducerPath]: releasesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(releasesApi.middleware),
});
