import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oficina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oficina.html',
})
export class OficinaPage {
  oficina: any = {
    nome: '',
    endereco: '',
    endereco_numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    celular: '',
    email: '',
    site: '',
    especialidades: '',
    observacoes: '',
  };

  lista: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.carregar();
  }

  async carregar() {
    try {
      const res = await (window as any).electronAPI.listarOficinas();
      if (res.success && res.oficinas && res.oficinas.length > 0) {
        // pega a primeira oficina cadastrada (app suporta 1 por enquanto)
        this.lista = res.oficinas;
        this.oficina = { ...res.oficinas[0] };
      }
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Erro ao carregar oficina', err);
    }
  }

  async salvar() {
    try {
      const res = await (window as any).electronAPI.salvarOficina(this.oficina);
      if (res.success) {
        this.oficina = res.oficina;
        await this.carregar();
        alert('Oficina salva com sucesso');
      }
    } catch (err) {
      console.error('Erro ao salvar oficina', err);
      alert('Erro ao salvar oficina');
    }
  }
}
