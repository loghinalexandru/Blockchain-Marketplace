import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectComponent } from './pages/connect/connect.component';
import { HomeComponent } from './pages/home/home.component';


const routes: Routes = [
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "connect",
    component: ConnectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
