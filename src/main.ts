import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/shared/app.component';
import { appConfig } from './app/app.config';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideRouter(appRoutes)
  ]
})
  .catch(err => console.error(err));
