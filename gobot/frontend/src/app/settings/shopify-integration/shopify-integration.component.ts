import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ShopifyStore {
  id?: string;
  shopUrl: string;
  accessToken?: string;
  isActive: boolean;
  productCount?: number;
  lastSync?: Date;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  image?: string;
  status: string;
}

@Component({
  selector: 'app-shopify-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './shopify-integration.component.html',
  styleUrl: './shopify-integration.component.scss'
})
export class ShopifyIntegrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Form and data properties
  shopifyForm: FormGroup;
  selectedBot = 'bot1';
  isChatbotActive = true;
  isLoading = false;
  loadingMessage = '';
  
  // Store data
  currentStore: ShopifyStore | null = null;
  products: ShopifyProduct[] = [];
  productCount = 0;

  constructor() {
    this.shopifyForm = this.fb.group({
      shopUrl: ['', [Validators.required, this.shopifyUrlValidator]]
    });
  }

  ngOnInit() {
    this.loadStoreData();
  }

  // Custom validator for Shopify URL
  shopifyUrlValidator(control: any) {
    if (!control.value) return null;
    
    const shopifyRegex = /^[a-zA-Z0-9\-]+\.myshopify\.com$|^[a-zA-Z0-9\-]+\.(com|org|net|io|co)$/;
    return shopifyRegex.test(control.value) ? null : { invalidShopifyUrl: true };
  }

  // Load existing store data (simulate API call)
  loadStoreData() {
    // Simulate loading from localStorage or API
    const savedStore = localStorage.getItem('shopifyStore');
    if (savedStore) {
      this.currentStore = JSON.parse(savedStore);
      this.shopifyForm.patchValue({ shopUrl: this.currentStore!.shopUrl });
      this.loadProducts();
    }
  }

  // Form submission
  onSubmit() {
    if (this.shopifyForm.valid) {
      this.isLoading = true;
      this.loadingMessage = 'Connecting to Shopify store...';

      const shopUrl = this.shopifyForm.value.shopUrl;

      // Simulate API call
      setTimeout(() => {
        this.currentStore = {
          id: Date.now().toString(),
          shopUrl: shopUrl,
          isActive: true,
          productCount: Math.floor(Math.random() * 100) + 1,
          lastSync: new Date()
        };

        // Save to localStorage (in real app, this would be an API call)
        localStorage.setItem('shopifyStore', JSON.stringify(this.currentStore));
        
        this.loadProducts();
        this.isLoading = false;
        this.loadingMessage = '';
        
        // Show success message
        alert('Shopify store connected successfully!');
      }, 2000);
    }
  }

  // Sync products
  syncProducts() {
    if (!this.currentStore) return;

    this.isLoading = true;
    this.loadingMessage = 'Syncing products from Shopify...';

    setTimeout(() => {
      this.loadProducts();
      this.currentStore!.lastSync = new Date();
      this.currentStore!.productCount = this.products.length;
      localStorage.setItem('shopifyStore', JSON.stringify(this.currentStore));
      
      this.isLoading = false;
      this.loadingMessage = '';
      
      alert(`Successfully synced ${this.products.length} products!`);
    }, 3000);
  }

  // Load products (simulate API call)
  loadProducts() {
    // Simulate product data
    this.products = [
      {
        id: '1',
        title: 'Premium Cotton T-Shirt',
        handle: 'premium-cotton-tshirt',
        price: '29.99',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
        status: 'Active'
      },
      {
        id: '2',
        title: 'Wireless Bluetooth Headphones',
        handle: 'wireless-bluetooth-headphones',
        price: '79.99',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        status: 'Active'
      },
      {
        id: '3',
        title: 'Leather Wallet',
        handle: 'leather-wallet',
        price: '49.99',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop',
        status: 'Draft'
      },
      // Add more mock products...
    ];

    this.productCount = this.products.length;
  }

  // Remove store
  removeStore() {
    if (confirm('Are you sure you want to remove the Shopify store connection? This will delete all synced data.')) {
      this.currentStore = null;
      this.products = [];
      this.productCount = 0;
      this.shopifyForm.reset();
      localStorage.removeItem('shopifyStore');
      alert('Shopify store connection removed successfully!');
    }
  }

  // Show all products
  showAllProducts() {
    // In a real app, this might open a modal or navigate to a products page
    alert(`Showing all ${this.products.length} products...`);
  }

  // Header button actions
  openAgenticPlatform() {
    window.open('https://app.botsify.com/agentic', '_blank');
  }

  openPartnerPortal() {
    window.open('https://partners.botsify.com', '_blank');
  }

  openProfile() {
    // Handle profile menu
    alert('Profile menu opened');
  }

  openTutorial() {
    window.open('https://help.botsify.com/plugins/integrate-shopify-with-botsify-shopify-chatbot/', '_blank');
  }

  goToGeneralSettings() {
    // Navigate to general settings
    alert('Navigating to General Settings...');
  }
}