import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuilomboDetalheComponent } from './quilombo-detalhe.component';

describe('QuilomboDetalheComponent', () => {
  let component: QuilomboDetalheComponent;
  let fixture: ComponentFixture<QuilomboDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuilomboDetalheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuilomboDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
