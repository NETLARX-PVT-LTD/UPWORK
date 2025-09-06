import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core'; // Import importProvidersFrom
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
// Import Angular Material Modules and FormsModule/ReactiveFormsModule
import { DragDropModule } from '@angular/cdk/drag-drop'; // This is a module, needs importProvidersFrom
import { MatInputModule } from '@angular/material/input'; // Module
import { MatFormFieldModule } from '@angular/material/form-field'; // Module
import { MatIconModule } from '@angular/material/icon'; // Module
import { MatButtonModule } from '@angular/material/button'; // Module
// You also need MatMenuModule, MatSelectModule, MatButtonToggleModule based on your template
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // FormsModule is for [(ngModel)], ReactiveFormsModule for reactive forms
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
     provideHttpClient(
      withInterceptorsFromDi()
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), // Correctly provides animation capabilities

    // --- CORRECT WAY TO ADD MODULES IN STANDALONE APP CONFIG ---
    // Use importProvidersFrom for any NgModules you want to make available globally
    importProvidersFrom(
      DragDropModule,
      MatInputModule,
      MatFormFieldModule,
      MatIconModule,
      MatButtonModule,
      MatMenuModule,         // <--- Add this
      MatSelectModule,       // <--- Add this
       MatDialogModule,
      MatButtonToggleModule, // <--- Add this
      FormsModule,           // <--- Add this for [(ngModel)]
      ReactiveFormsModule,    // <--- Keep this if you use reactive forms
       HttpClientModule ,
    )
  ]
};