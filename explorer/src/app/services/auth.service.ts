import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

// Interfejs koji odgovara DTO objektu sa bekenda
export interface UserDto {
  id: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Koristimo proxy, zato nema localhost:8080
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Pokušava da prijavi korisnika na sistem.
   * @param credentials Objekat sa email-om i lozinkom.
   * @returns Observable<any> sa odgovorom servera.
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' })
      .pipe(
        tap(() => {
          // Nakon uspešnog logina, odmah proveravamo ko je ulogovan
          this.checkUserRole().subscribe();
        })
      );
  }

  /**
   * Proverava da li postoji aktivna sesija i koja je uloga korisnika.
   * @returns Observable<UserDto | null>
   */
  checkUserRole(): Observable<UserDto | null> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        // Čuvamo podatke o korisniku u BehaviorSubject
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        // Ako dođe do greške (npr. 401), korisnik nije ulogovan
        this.currentUserSubject.next(null);
        return of(null); // Vraćamo null da ne bi prekinuli stream
      })
    );
  }

  /**
   * Proverava da li je trenutni korisnik Admin.
   * Koristi se u AuthGuard-u.
   * @returns Observable<boolean>
   */
  isAdmin(): Observable<boolean> {
    return this.checkUserRole().pipe(
      map(user => user?.role === 'ADMIN'),
      catchError(() => of(false))
    );
  }

  /**
   * Odjavljuje korisnika.
   * U realnoj aplikaciji ovde bi postojao i poziv ka backendu za invalidaciju sesije/tokena.
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }
}
