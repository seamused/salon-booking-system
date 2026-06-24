// Loaded at runtime from /api/config — this is just the shape/fallback.
// Colors here must match index.css :root variables to avoid a flash if ever
// used to apply styles before the server config arrives.
export const defaultConfig = {
  branding: {
    salonName: "Salon",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    timezone: "America/New_York",
    colors: {
      primary:   "#ec395f",
      secondary: "#c66e81",
      tertiary:  "#a81f3d",
      accent:    "#f5f0eb",
      text:      "#333333",
    },
  },
  services: [],
  businessHours: {},
};
