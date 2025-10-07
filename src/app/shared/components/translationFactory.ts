import { TranslateService } from "@ngx-translate/core";
import { localKeys } from "src/app/core/constants/localStorage.keys";
import { LocalStorageService } from "src/app/core/services";

export function translateFactory(
  service: TranslateService, 
  localStorage: LocalStorageService
): Function {
  return async () => {
    service.setDefaultLang('en');
    
    service.use('en');

    setTimeout(async () => {
      try {
        const data = await localStorage.getLocalData(localKeys.SELECTED_LANGUAGE);
        const savedLang = data?.value;
        if (savedLang && savedLang !== 'en') {
          service.use(savedLang);
        }
      } catch (err) {
        console.warn("Could not load saved language:", err);
      }
    }, 0);

    return Promise.resolve();
  };
}