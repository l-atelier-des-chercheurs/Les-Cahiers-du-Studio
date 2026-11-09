import type { AppInfos } from "./adc/types";

declare global {
  // set by adc-core's index.pug
  interface Window {
    app_infos: AppInfos;
  }
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

export {};
