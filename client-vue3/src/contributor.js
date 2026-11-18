import { ref, watch } from "vue";
import { readJSON, writeJSON } from "@/adc/storage";

// The name a participant gives, without an account (cahiers open to
// everyone): saved with each media they add, as adc-core's $credits, and
// remembered in this browser for their next contributions.
const STORAGE_KEY = "cahiers.contributor_name";

export const contributor_name = ref(readJSON(STORAGE_KEY) || "");

watch(contributor_name, (name) =>
  writeJSON(STORAGE_KEY, name.trim() ? name.trim() : undefined)
);

// to add to a new media's meta
export function creditsMeta() {
  const name = contributor_name.value.trim();
  return name ? { $credits: name } : {};
}
