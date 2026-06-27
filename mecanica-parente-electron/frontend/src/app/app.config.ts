import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { APP_VERSION } from '../environments/version';

// Exporta a versão para que outros módulos possam importá-la facilmente
export const APP_INFO = {
  version: APP_VERSION,
};

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes, withHashLocation())],
};
