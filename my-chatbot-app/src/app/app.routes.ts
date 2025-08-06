import { RouterModule, Routes } from '@angular/router';
import { ChatbotFlowComponent } from './chatbot-flow/chatbot-flow.component';
import { MediaBlockPageComponent } from './media-block-page/media-block-page.component';
// import { MediaBlockDetailComponent } from './media-block-page/media-block-detail/media-block-detail.component';
import { NgModule } from '@angular/core';
// import { MediaConfigComponent } from './media-block-page/media-config/media-config.component';
// import { MediaBlockEditPageComponent } from './media-block-page/media-block-edit-page/media-block-edit-page.component';

export const routes: Routes = [
  // Your other routes
  { path: 'media-blocks', component: MediaBlockPageComponent },
  // { path: 'media-block-detail/:id', component: MediaBlockDetailComponent },
  //  { path: 'media-config/:id', component: MediaConfigComponent },
  //  { path: 'media-block/edit/:id', component: MediaBlockEditPageComponent },
  // Route for your Create Story page
  { path: 'create-story', component: ChatbotFlowComponent },

  // Optional: A default route to redirect to the 'create-story' page
  { path: '', redirectTo: '/create-story', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}