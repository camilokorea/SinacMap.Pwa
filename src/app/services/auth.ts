import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  user$ = user(this.auth);

  loginWithGoogle(): Observable<void> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  getToken(): Observable<string | null> {
    return this.user$.pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken());
        }
        return of(null);
      })
    );
  }
}
