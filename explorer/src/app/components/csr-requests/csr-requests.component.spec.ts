import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsrRequestsComponent } from './csr-requests.component';

describe('CsrRequestsComponent', () => {
  let component: CsrRequestsComponent;
  let fixture: ComponentFixture<CsrRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsrRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsrRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
