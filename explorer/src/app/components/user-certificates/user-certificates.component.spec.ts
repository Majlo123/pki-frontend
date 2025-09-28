import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCertificatesComponent } from './user-certificates.component';

describe('UserCertificatesComponent', () => {
  let component: UserCertificatesComponent;
  let fixture: ComponentFixture<UserCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
