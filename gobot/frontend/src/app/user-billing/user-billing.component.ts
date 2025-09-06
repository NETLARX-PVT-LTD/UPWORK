// src/app/user-billing/user-billing.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  downloadUrl?: string;
}

interface PlanOption {
  name: string;
  price: number;
  billing: string;
  features: string[];
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  couponCode: string;
}

@Component({
  selector: 'app-user-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './user-billing.component.html'
})
export class UserBillingComponent implements OnInit {
  invoices: Invoice[] = [
    // Uncomment to test with sample data:
    // {
    //   id: 'INV-001',
    //   date: '2024-08-01',
    //   amount: 29.99,
    //   status: 'paid',
    //   downloadUrl: '/api/invoices/INV-001/download'
    // },
    // {
    //   id: 'INV-002',
    //   date: '2024-09-01',
    //   amount: 29.99,
    //   status: 'pending'
    // }
  ];

  nextBillingDate: string = '';
  
  // Modal states
  showChangePlanModal: boolean = false;
  showChangePaymentModal: boolean = false;
  showCancelPlanModal: boolean = false;
  
  // Form data
  paymentInfo: PaymentInfo = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    couponCode: ''
  };
  
  cancelReason: string = '';

  constructor() {}

  ngOnInit(): void {
    this.calculateNextBillingDate();
  }

  private calculateNextBillingDate(): void {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    this.nextBillingDate = nextMonth.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Modal methods
  openChangePlanModal(): void {
    this.showChangePlanModal = true;
  }

  closeChangePlanModal(): void {
    this.showChangePlanModal = false;
  }

  openChangePaymentModal(): void {
    this.showChangePaymentModal = true;
  }

  closeChangePaymentModal(): void {
    this.showChangePaymentModal = false;
    this.resetPaymentInfo();
  }

  openCancelPlanModal(): void {
    this.showCancelPlanModal = true;
  }

  closeCancelPlanModal(): void {
    this.showCancelPlanModal = false;
    this.cancelReason = '';
  }

  // Action methods
  contactUs(): void {
    console.log('Contacting support for plan change');
    // Here you would typically open a support ticket or redirect to contact page
    alert('Redirecting to contact support...');
    this.closeChangePlanModal();
  }

  updatePaymentInfo(): void {
    if (!this.paymentInfo.cardNumber || !this.paymentInfo.expiryDate || 
        !this.paymentInfo.cvv || !this.paymentInfo.nameOnCard) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('Updating payment information:', this.paymentInfo);
    // Here you would typically call your payment service
    alert('Payment information updated successfully!');
    this.closeChangePaymentModal();
  }

  submitCancellation(): void {
    if (!this.cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }
    
    console.log('Cancellation reason:', this.cancelReason);
    // Here you would typically call your cancellation service
    const confirmCancel = confirm('Are you sure you want to cancel your subscription?');
    if (confirmCancel) {
      alert('Your cancellation request has been submitted. You will receive a confirmation email shortly.');
      this.closeCancelPlanModal();
    }
  }

  private resetPaymentInfo(): void {
    this.paymentInfo = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      couponCode: ''
    };
  }

  downloadInvoice(invoice: Invoice): void {
    console.log('Downloading invoice:', invoice.id);
    
    // Here you would typically trigger a download from your API
    // Example:
    // this.billingService.downloadInvoice(invoice.id).subscribe(
    //   (blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `invoice-${invoice.id}.pdf`;
    //     link.click();
    //     window.URL.revokeObjectURL(url);
    //   },
    //   error => {
    //     console.error('Error downloading invoice:', error);
    //   }
    // );
    
    // For demo purposes, show alert
    alert(`Downloading invoice ${invoice.id}...`);
  }

  payInvoice(invoice: Invoice): void {
    console.log('Paying invoice:', invoice.id);
    
    // Here you would typically redirect to a payment gateway or open a payment modal
    // Example:
    // this.router.navigate(['/payment'], { queryParams: { invoiceId: invoice.id } });
    // or
    // this.paymentService.openPaymentModal(invoice);
    
    const confirmPay = confirm(`Pay $${invoice.amount} for invoice ${invoice.id}?`);
    if (confirmPay) {
      // Simulate payment processing
      alert('Redirecting to payment gateway...');
    }
  }
}