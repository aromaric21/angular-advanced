import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from './services/login/login-service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatButtonModule],
})
class App implements OnDestroy {
  private loginService = inject(LoginService);
  private router = inject(Router);

  protected user = this.loginService.user;

  private logoutSubscription: Subscription | null = null;

  logout() {
    this.logoutSubscription = this.loginService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  ngOnDestroy(): void {
    this.logoutSubscription?.unsubscribe();
  }
}

export default App;
