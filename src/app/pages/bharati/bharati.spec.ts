import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bharati } from './bharati';

describe('Bharati', () => {
  let component: Bharati;
  let fixture: ComponentFixture<Bharati>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bharati],
    }).compileComponents();

    fixture = TestBed.createComponent(Bharati);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
