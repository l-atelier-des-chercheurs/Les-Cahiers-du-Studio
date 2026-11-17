import { createI18n } from "vue-i18n";
import fr from "./locales/fr.json";

// French only for now: every string goes through $t so that other
// languages can be added as locales/<lang>.json
export const i18n = createI18n({
  legacy: false,
  locale: "fr",
  fallbackLocale: "fr",
  messages: { fr },
});
