import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export default class Dashboard {
  authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout();
  }
}
