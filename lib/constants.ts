import {
  Camera,
  Gamepad2,
  Headphones,
  Monitor,
  Smartphone,
  Watch,
} from "lucide-react";
export const WhatsappPhoneNumber = +254757011738;
export const AUTO_SLIDE_INTERVAL = 5000;

export const SPEC_CATEGORIES = {
  "General Information": ["price", "brand", "category", "stock", "rating"],
  "Technical Specifications": [
    "processor",
    "cpu",
    "ram",
    "memory",
    "storage",
    "ssd",
    "hdd",
    "graphics",
    "gpu",
    "display",
    "screen",
    "screensize",
    "screen size",
    "resolution",
    "os",
    "operating_system",
    "battery",
    "camera",
    "connectivity",
    "wifi",
    "bluetooth",
  ],
  "Physical Specifications": [
    "weight",
    "dimensions",
    "size",
    "color",
    "material",
    "design",
  ],
  Features: [
    "features",
    "ports",
    "optical_drive",
    "touchscreen",
    "backlit_keyboard",
    "fingerprint",
    "webcam",
  ],
};

// Icon mapping for categories
export const categoryIcons = {
  phones: Smartphone,
  computers: Monitor,
  smartwatch: Watch,
  camera: Camera,
  headphones: Headphones,
  gaming: Gamepad2,
};
