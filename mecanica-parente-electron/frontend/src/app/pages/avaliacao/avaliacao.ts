import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // 🌟 IMPORT DO SWEETALERT ADICIONADO AQUI

@Component({
  selector: 'app-avaliacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avaliacao.html',
})
export class Avaliacao {
  clienteId: number | null = null;
  veiculoId: number | null = null;

  veiculosDoCliente: any[] = [];

  // 🌟 NOVA VARIÁVEL: Para mostrar a listinha de nomes
  clientesEncontrados: any[] = [];

  form = {
    cliente: '',
    telefone: '',
    celular: '',
    veiculo: '',
    marca: '',
    cor: '',
    ano: '',
    placa: '',
    relato: '',
    tecnico: 'Sid',
  };

  itensAvaliacao = [
    { item: 'Nível de Óleo', status: 'OK', observacao: '' },
    { item: 'Freios', status: 'OK', observacao: '' },
    { item: 'Suspensão', status: 'OK', observacao: '' },
    { item: 'Sistema Elétrico', status: 'OK', observacao: '' },
    { item: 'Pneus', status: 'OK', observacao: '' },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  // ==========================================
  // BUSCA E AUTO-COMPLETAR INTELIGENTE
  // ==========================================
  async buscarCliente() {
    // Se apagar o nome, limpamos tudo para não haver confusão
    if (this.form.cliente.length < 3) {
      this.clientesEncontrados = [];
      this.clienteId = null;
      this.veiculosDoCliente = [];
      return;
    }

    const res = await (window as any).electronAPI.buscarClientePorNome(this.form.cliente);
    if (res.success && res.clientes.length > 0) {
      // Em vez de preencher tudo automático, mostramos a lista de opções
      this.clientesEncontrados = res.clientes;
      this.cdr.detectChanges();
    } else {
      this.clientesEncontrados = [];
    }
  }

  // 🌟 NOVA FUNÇÃO: O que acontece quando clica no nome da listinha
  async selecionarClienteDaLista(cli: any) {
    this.clienteId = cli.id;

    // AQUI COMPLETAMOS O RESTO DO NOME E OS DADOS
    this.form.cliente = cli.nome;
    this.form.telefone = cli.telefone || '';
    this.form.celular = cli.celular || '';

    // Esconde a listinha
    this.clientesEncontrados = [];

    // Busca os carros deste cliente
    await this.buscarVeiculosDoCliente(cli.id);
    this.cdr.detectChanges();
  }

  async buscarVeiculosDoCliente(id: number) {
    const res = await (window as any).electronAPI.listarVeiculos(id);
    if (res.success) {
      this.veiculosDoCliente = res.veiculos;
    }
  }

  selecionarVeiculoDaLista(vei: any) {
    this.veiculoId = vei.id;
    this.form.placa = vei.placa;
    this.form.veiculo = vei.modelo || '';
    this.form.marca = vei.marca || '';
    this.form.cor = vei.cor || '';
    this.form.ano = vei.ano || '';
  }

  async buscarVeiculo() {
    if (this.form.placa.length >= 7) {
      const res = await (window as any).electronAPI.buscarVeiculoPorPlaca(
        this.form.placa.toUpperCase(),
      );

      if (res.success && res.veiculo) {
        const vei = res.veiculo;
        this.veiculoId = vei.id;
        this.form.veiculo = vei.modelo || '';
        this.form.marca = vei.marca || '';
        this.form.cor = vei.cor || '';
        this.form.ano = vei.ano || '';
        this.cdr.detectChanges();
      } else {
        this.veiculoId = null;
      }
    }
  }

  // ==========================================
  // SALVAR NO BANCO E GERAR PDF
  // ==========================================
  async gerarPDF() {
    if (!this.clienteId && this.form.cliente) {
      const resCli = await (window as any).electronAPI.salvarCliente({
        nome: this.form.cliente,
        telefone: this.form.telefone,
        celular: this.form.celular,
      });
      if (resCli.success) this.clienteId = resCli.cliente.id;
    }

    if (!this.veiculoId && this.form.placa && this.clienteId) {
      const resVei = await (window as any).electronAPI.salvarVeiculo({
        cliente_id: this.clienteId,
        modelo: this.form.veiculo,
        marca: this.form.marca,
        placa: this.form.placa.toUpperCase(),
        cor: this.form.cor,
        ano: this.form.ano,
      });
      if (resVei.success) this.veiculoId = resVei.veiculo.id;
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');

    const linhasTabelaChecklist = this.itensAvaliacao
      .map(
        (i) =>
          `<tr>
        <td style="padding: 5px;">${i.item}</td>
        <td style="padding: 5px; text-align: center;"><b>${i.status}</b></td>
        <td style="padding: 5px;">${i.observacao}</td>
      </tr>`,
      )
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; font-size: 14px; }
            .bold { font-weight: bold; }
            .mb-1 { margin-bottom: 5px; } .mb-3 { margin-bottom: 15px; }
            .grid-2 { display: flex; justify-content: space-between; width: 100%; } .col { flex: 1; }
            .box { border: 1px solid #000; min-height: 80px; margin-top: 5px; width: 100%; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;}
            th, td { border: 1px solid #000; padding: 8px; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 20px; font-size: 12px; line-height: 1.4;">
            <div>JACAREÍ-SP</div>
            <div style="font-size: 18px; font-weight: bold; margin: 5px 0;">MECÂNICA PARENTE</div>
            <div>AVENIDA MARIA AUGUSTA FAGUNDES GOMES 105 (12)3956-1806</div>
            <div>CEP: 12322-300</div>
            <div>ELÉTRICA-AUTO MECÂNICA-MECÂNICA DIESEL-INJEÇÃO ELETRÔNICA</div>
          </div>

          <div style="text-align: center; font-size: 16px; font-weight: bold;">Avaliação Técnica</div>
          <div style="text-align: right; font-weight: bold; margin-bottom: 15px;">N°: ${this.veiculoId || 'Novo'}</div>

          <div class="grid-2 mb-1">
            <div class="col"><span class="bold">Data Entrada:</span> ${dataAtual}</div>
            <div class="col"><span class="bold">Hora:</span> ${horaAtual}</div>
          </div>

          <div class="grid-2 mb-3">
            <div class="col"><span class="bold">Cliente:</span> ${this.form.cliente}</div>
            <div class="col"><span class="bold">Telefone/Celular:</span> ${this.form.telefone} ${this.form.celular ? ' / ' + this.form.celular : ''}</div>
          </div>

          <div class="mb-1 bold">Dados do Veículo:</div>
          <div class="grid-2 mb-1">
            <div class="col"><span class="bold">Veículo/Marca:</span> ${this.form.veiculo} / ${this.form.marca}</div>
            <div class="col"><span class="bold">Placa:</span> ${this.form.placa.toUpperCase()}</div>
          </div>
          <div class="grid-2 mb-3">
            <div class="col"><span class="bold">Cor:</span> ${this.form.cor}</div>
            <div class="col"><span class="bold">Ano:</span> ${this.form.ano}</div>
          </div>

          <div class="mb-3">
            <span class="bold">Ocorrência relatada:</span> ${this.form.relato}
          </div>

          <div class="mb-1 bold mt-3">Checklist Técnico:</div>
          <table>
            <thead><tr><th>Item Avaliado</th><th>Status</th><th>Observação</th></tr></thead>
            <tbody>${linhasTabelaChecklist}</tbody>
          </table>

          <div class="mb-1 bold">Observações Técnicas Finais:</div>
          <div class="box mb-3"></div>

          <div class="bold" style="margin-top: 30px;">Técnico Responsável: ${this.form.tecnico}</div>
        </body>
      </html>
    `;

    try {
      const nomeArquivo = `Avaliacao-${this.form.placa || 'Nova'}.pdf`;
      const result = await (window as any).electronAPI.printPDF({
        cliente: this.form.cliente || 'Oficina',
        servico: 'Avaliacao',
        nomeArquivo,
        html,
      });
      if (result?.success) {
        // 🌟 SUBSTITUÍDO PELO SWEETALERT 🌟
        Swal.fire({
          title: 'Avaliação Salva!',
          text: 'PDF gerado com sucesso em: ' + result.path,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      } else {
        // 🌟 SUBSTITUÍDO PELO SWEETALERT 🌟
        Swal.fire({
          title: 'Erro ao salvar',
          text: result?.error || 'Erro desconhecido no sistema',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      // 🌟 SUBSTITUÍDO PELO SWEETALERT 🌟
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Falha na comunicação ao gerar o PDF da Avaliação.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }
}
