/**
 * Modal de pago para el carrito de compras
 * Muestra métodos de pago disponibles y permite seleccionar uno
 */

import { get } from '../../utils/manejo_api_optimizado.js';

export class PaymentModal {
  constructor() {
    this.modal = null;
    this.paymentMethods = [];
  }

  async init() {
    await this.createModal();
    await this.loadPaymentMethods();
    this.bindEvents();
  }

  async createModal() {
    // Crear estructura del modal
    const modalHTML = `
      <div id="payment-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Confirmar Compra</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="payment-section">
              <h3>Método de Pago</h3>
              <select id="payment-method-select" class="payment-dropdown">
                <option value="">Selecciona un método de pago</option>
              </select>
            </div>
            <div class="order-summary">
              <h3>Resumen del Pedido</h3>
              <div class="summary-items"></div>
              <div class="total-amount">
                <strong>Total: <span id="modal-total">$0.00</span></strong>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="cancel-payment">Cancelar</button>
            <button type="button" class="btn-primary" id="confirm-payment">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `;

    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('payment-modal');
  }

  async loadPaymentMethods() {
    try {
      const response = await get('metodos');
      this.paymentMethods = response?.data || response || [];
      this.renderPaymentMethods();
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      this.paymentMethods = [
        { id: 1, nombre: 'Tarjeta de Crédito' },
        { id: 2, nombre: 'Tarjeta de Débito' },
        { id: 3, nombre: 'Transferencia Bancaria' },
        { id: 4, nombre: 'PayPal' }
      ];
      this.renderPaymentMethods();
    }
  }

  renderPaymentMethods() {
    const select = document.getElementById('payment-method-select');
    select.innerHTML = '<option value="">Selecciona un método de pago</option>';
    
    this.paymentMethods.forEach(method => {
      const option = document.createElement('option');
      option.value = method.id;
      option.textContent = method.nombre;
      select.appendChild(option);
    });
  }

  bindEvents() {
    // Cerrar modal
    this.modal.querySelector('.modal-close').addEventListener('click', () => {
      this.hide();
    });

    this.modal.querySelector('#cancel-payment').addEventListener('click', () => {
      this.hide();
    });

    // Cerrar al hacer clic fuera
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Confirmar pago
    this.modal.querySelector('#confirm-payment').addEventListener('click', () => {
      this.processPayment();
    });
  }

  show(totalAmount) {
    // Actualizar total en el modal
    document.getElementById('modal-total').textContent = `$${totalAmount.toFixed(2)}`;
    
    // Mostrar modal
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  async processPayment() {
    const selectedMethod = document.getElementById('payment-method-select').value;
    
    if (!selectedMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    const selectedMethodName = this.paymentMethods.find(m => m.id == selectedMethod)?.nombre;
    
    // Aquí iría la lógica para procesar el pago
    console.log('Procesando pago con:', selectedMethodName);
    
    // Simular procesamiento
    this.hide();
    
    // Mostrar confirmación
    import('../../utils/alert.js').then(({ success }) => {
      success(`Pago procesado exitosamente con ${selectedMethodName}`);
    });
  }

  destroy() {
    if (this.modal) {
      this.modal.remove();
    }
  }
}
