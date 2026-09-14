import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Maitri } from './maitri';

describe('Maitri', () => {
  let component: Maitri;
  let fixture: ComponentFixture<Maitri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Maitri],
    }).compileComponents();

    fixture = TestBed.createComponent(Maitri);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
