import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, single, tap } from 'rxjs';
import { User } from '../../models/user';


export interface LoginCredentialsDTO {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private LK_TOKEN = 'TOKEN';
  private BASE_URL = 'http://localhost:3000';
  private http = inject(HttpClient);
  user = signal<User | null | undefined>(undefined);

  login(credentials: LoginCredentialsDTO) {
    return this.http.post(this.BASE_URL + '/login', credentials).pipe(
      tap((result: any) =>{
        localStorage.setItem(this.LK_TOKEN, result['token']);
      })
    );
  }

  getUser():Observable<User | null | undefined> {
    return this.http.get(this.BASE_URL + '/me').pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result);
        this.user.set(user);
      }),
      map(() => this.user())
    );
  }

  logout(){
    return this.http.post(this.BASE_URL + '/logout', {}).pipe(
      tap(( any) => {
        localStorage.removeItem(this.LK_TOKEN);
        this.user.set(null);
      })
    )
  }

}

