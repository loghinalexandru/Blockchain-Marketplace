import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContractsService } from './services/services/contracts.service';
import { MetaMaskService } from './services/services/metamask.service';
import { Web3Service } from './services/services/web3.service';
import { ConnectComponent } from './pages/connect/connect.component';
import { HomeComponent } from './pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './comp/header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatNativeDateModule } from '@angular/material/core';
import { NewProductDialog } from './pages/home/new-product/new-product.dialog';
import { NewManagerDialog } from './pages/home/new-manager/new-manager.dialog';
import { ProductComponent } from './pages/home/product/product.component';
import { NewBuyTokensDialog } from './pages/home/tokens/new-buy-tokens.dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { NewRoleExpertiseDialog } from './pages/home/new-role-expertise/new-role-expertise.dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FundDialog } from './pages/home/product/fund-dialog/fund.dialog';
import { ProductNotifierService } from './services/services/product-notifier.service';
import { UserService } from './services/services/user.service';
import { JoinFreelancerDialog } from './pages/home/product/join-freelancer/join-freelancer.dialog';
import { ViewApplicantsDialog } from './pages/home/product/view-applicants/view-applicants.dialog';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    ConnectComponent,
    HomeComponent,
    HeaderComponent,
    NewProductDialog,
    NewManagerDialog,
    NewBuyTokensDialog,
    NewRoleExpertiseDialog,
    FundDialog,
    ProductComponent,
    JoinFreelancerDialog,
    ViewApplicantsDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatTableModule
  ],
  providers: [
    ContractsService,
    MetaMaskService,
    Web3Service,
    ProductNotifierService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
