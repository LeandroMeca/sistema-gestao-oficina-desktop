import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // 🌟 IMPORT DO SWEETALERT ADICIONADO AQUI

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  abaAtiva: 'cliente' | 'veiculo' = 'cliente';

  listaClientes: any[] = [];
  listaVeiculos: any[] = [];

  clienteSelecionado: any = null;

  // Atualizado para bater 100% com o Banco de Dados
  clienteForm = {
    nome: '',
    endereco: '',
    bairro: '',
    cidade: '',
    uf: '',
    cpf: '',
    rg: '',
    nascimento: '',
    telefone: '',
    celular: '',
  };

  // Atualizado para bater 100% com o Banco de Dados
  veiculoForm = {
    cliente_id: null as number | null,
    modelo: '',
    marca: '',
    placa: '',
    cor: '',
    ano: '',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarClientes();
  }

  setAba(aba: 'cliente' | 'veiculo') {
    this.abaAtiva = aba;
  }

  selecionarCliente(cliente: any) {
    this.clienteSelecionado = cliente;
    this.veiculoForm.cliente_id = cliente.id;
    this.abaAtiva = 'veiculo';
    this.carregarVeiculos();
  }

  async carregarClientes() {
    try {
      const resultado = await (window as any).electronAPI.listarClientes();
      if (resultado.success) {
        this.listaClientes = resultado.clientes;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    }
  }

  async carregarVeiculos() {
    if (!this.clienteSelecionado) return;
    try {
      const resultado = await (window as any).electronAPI.listarVeiculos(
        this.clienteSelecionado.id,
      );
      if (resultado.success) {
        this.listaVeiculos = resultado.veiculos;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erro ao carregar veículos', error);
    }
  }

  // ==========================================
  // SALVAR CLIENTE COM SWEETALERT
  // ==========================================
  async salvarCliente() {
    if (!this.clienteForm.nome) {
      Swal.fire({
        title: 'Campos Obrigatórios',
        text: 'Preencha pelo menos o Nome do cliente!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b', // Amarelo
      });
      return;
    }

    try {
      const resultado = await (window as any).electronAPI.salvarCliente(this.clienteForm);

      if (resultado.success) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Cliente salvo com sucesso!',
          icon: 'success',
          confirmButtonColor: '#10b981', // Verde
        });

        // Limpar o formulário
        this.clienteForm = {
          nome: '',
          endereco: '',
          bairro: '',
          cidade: '',
          uf: '',
          cpf: '',
          rg: '',
          nascimento: '',
          telefone: '',
          celular: '',
        };
        this.carregarClientes();
      } else {
        Swal.fire({
          title: 'Erro ao Salvar',
          text: resultado.error,
          icon: 'error',
          confirmButtonColor: '#ef4444', // Vermelho
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Falha na comunicação com o banco de dados.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }

  // ==========================================
  // SALVAR VEÍCULO COM SWEETALERT
  // ==========================================
  async salvarVeiculo() {
    if (!this.clienteSelecionado) {
      Swal.fire({
        title: 'Atenção',
        text: 'Você precisa selecionar um cliente primeiro na aba de clientes!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    if (!this.veiculoForm.placa || !this.veiculoForm.modelo) {
      Swal.fire({
        title: 'Campos Obrigatórios',
        text: 'Modelo e Placa são obrigatórios!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    try {
      const resultado = await (window as any).electronAPI.salvarVeiculo(this.veiculoForm);

      if (resultado.success) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Veículo salvo e vinculado com sucesso!',
          icon: 'success',
          confirmButtonColor: '#10b981',
        });

        // Limpar os dados do carro, mas manter o ID do dono
        this.veiculoForm = {
          cliente_id: this.clienteSelecionado.id,
          modelo: '',
          marca: '',
          placa: '',
          cor: '',
          ano: '',
        };
        this.carregarVeiculos();
      } else {
        Swal.fire({
          title: 'Erro ao Salvar',
          text: 'Erro: ' + resultado.error,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Falha na comunicação com o banco de dados.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }
}
