import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuilombosComponent } from './quilombos.component';

describe('QuilombosComponent', () => {
  let component: QuilombosComponent;
  let fixture: ComponentFixture<QuilombosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuilombosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuilombosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
