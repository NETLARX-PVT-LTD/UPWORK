// src/app/account-settings/account-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  accountForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      fullName: ['Vijai', [Validators.required]],
      email: ['vijaipidinti.123@gmail.com', [Validators.required, Validators.email]],
      oldPassword: ['', [Validators.required]],
      newPassword: [''],
      confirmPassword: [''],
      preferredLanguage: ['en', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Add custom validator for password confirmation
    this.accountForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
  }

  passwordMatchValidator(control: any) {
    const newPassword = this.accountForm?.get('newPassword')?.value;
    const confirmPassword = control.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onUpdateProfile(): void {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Updating profile:', formData);
      
      // Here you would typically call an API to update the user profile
      // Example:
      // this.userService.updateProfile(formData).subscribe(
      //   response => {
      //     console.log('Profile updated successfully');
      //     // Show success message
      //   },
      //   error => {
      //     console.error('Error updating profile:', error);
      //     // Show error message
      //   }
      // );
      
      // For now, just show a success message
      alert('Profile updated successfully!');
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  onDeleteAccount(): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete your complete account information? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      console.log('Deleting account...');
      
      // Here you would typically call an API to delete the account
      // Example:
      // this.userService.deleteAccount().subscribe(
      //   response => {
      //     console.log('Account deleted successfully');
      //     // Redirect to login or home page
      //   },
      //   error => {
      //     console.error('Error deleting account:', error);
      //   }
      // );
      
      alert('Account deletion initiated. You will be contacted for confirmation.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.accountForm.controls).forEach(key => {
      const control = this.accountForm.get(key);
      control?.markAsTouched();
    });
  }
}