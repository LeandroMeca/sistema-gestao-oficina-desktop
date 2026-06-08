import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroOs } from './cadastro-os';

describe('CadastroOs', () => {
  let component: CadastroOs;
  let fixture: ComponentFixture<CadastroOs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroOs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroOs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
