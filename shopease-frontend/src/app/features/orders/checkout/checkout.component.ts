import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../services/order.service';
import { CartService } from '../../cart/services/cart.service';
import { OrderRequest } from '../models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  loading = false;
  totalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      billingAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['CREDIT_CARD', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load cart items', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      return;
    }

    this.loading = true;
    // TODO: Replace with actual customer ID from auth service
    const customerId = 1;

    const orderRequest: OrderRequest = {
      customerId: customerId,
      totalAmount: this.totalAmount,
      shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
      billingAddress: this.checkoutForm.get('billingAddress')?.value,
      paymentMethod: this.checkoutForm.get('paymentMethod')?.value,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.loading = false;
        this.snackBar.open('Order placed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Clear cart after successful order
        this.cartService.clearCart().subscribe(() => {
          this.router.navigate(['/orders', order.id]);
        });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to place order', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkoutForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return 'Address must be at least 10 characters long';
    }
    return '';
  }
} 