import { configureStore } from "@reduxjs/toolkit";
import { releasesApi } from "../api/releasesApi";

export const store = configureStore({
  reducer: {
    [releasesApi.reducerPath]: releasesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(releasesApi.middleware),
});

// Types for later usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
