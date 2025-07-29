// src/app/shared/pipes/replace-spaces-with-underscores.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceSpacesWithUnderscores',
  standalone: true // Important for standalone components
})
export class ReplaceSpacesWithUnderscoresPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (typeof value !== 'string') {
      return '';
    }
    // Replace spaces and non-alphanumeric/underscore characters with underscores
    return value.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}