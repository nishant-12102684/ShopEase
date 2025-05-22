import { Component, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { OrderService } from '../features/orders/order.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from './order-dialog.component';

@Component({
  selector: 'app-cart',
  template: `
    <h2>Cart</h2>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <table *ngIf="cartItems.length">
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
      <tr *ngFor="let item of cartItems">
        <td>{{ item.productName }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.price | currency }}</td>
      </tr>
    </table>
    <div *ngIf="!cartItems.length && !loading">Your cart is empty.</div>
    <button *ngIf="cartItems.length" (click)="placeOrder()">Place Order</button>
  `,
  styles: [`.error { color: red; } table { width: 100%; margin-top: 16px; } th, td { padding: 8px; }`]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  error = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loading = true;
    this.cartService.getCartItems(1).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load cart items';
        this.loading = false;
      }
    });
  }

  placeOrder() {
    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '400px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(orderDetails => {
      if (orderDetails) {
        this.orderService.placeOrder(this.cartItems, orderDetails).subscribe({
          next: () => {
            alert('Order placed successfully!');
            this.cartItems = [];
          },
          error: () => {
            alert('Failed to place order.');
          }
        });
      }
    });
  }
} 