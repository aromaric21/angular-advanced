import { ChangeDetectionStrategy, Component, inject,} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './services/login/login-service';

import { MatButtonModule } from '@angular/material/button';
import { MainMenu } from './components/main-menu/main-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MainMenu],
})
export class App {
  private loginService = inject(LoginService);
  protected user = this.loginService.user;
}
