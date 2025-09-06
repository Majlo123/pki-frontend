import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

// Pretpostavka je da se vaše rute nalaze u app.routes.ts
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // LINIJA KOJA JE IZAZIVALA GREŠKU JE UKLONJENA (provideClientHydration())

    // Dodajemo HttpClient provajder na ispravan, standalone način
    provideHttpClient(withFetch())
  ]
};
