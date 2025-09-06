/**
 * Modal de pago para el carrito de compras
 * Muestra métodos de pago disponibles y permite seleccionar uno
 */

import { confirm, info } from '../../utils/alert.js';
import { get,post,put,del } from '../../utils/manejo_api_optimizado.js';
    //  const { get } = await import('../../utils/manejo_api_optimizado.js');
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
            <button class="modal-close" aria-label="Cerrar"><i data-lucide="x" class="icon"></i></button>
          </div>
          <div class="modal-body">
            <div class="payment-section">
              <h3>Método de Pago</h3>
              <select id="payment-method-select" class="payment-dropdown form__input register__input">
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
            <button type="button" class="btn--Notalert" id="cancel-payment">Cancelar</button>
            <button type="button" class="btn--Yesalert" id="confirm-payment">Confirmar Pago</button>
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
      const response = await get('metodos/activos');
      console.log('Métodos de pago recibidos:', response);
      
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response)) {
        this.paymentMethods = response;
      } else if (response?.data && Array.isArray(response.data)) {
        this.paymentMethods = response.data;
      } else if (response?.metodos && Array.isArray(response.metodos)) {
        this.paymentMethods = response.metodos;
      } else {
        this.paymentMethods = [];
      }
      
      this.renderPaymentMethods();
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      // Métodos de respaldo solo si no hay datos
      this.renderPaymentMethods();
    }
  }

  renderPaymentMethods() {
    const select = document.getElementById('payment-method-select');
    select.innerHTML = '<option value="">Selecciona un método de pago</option>';
    
    this.paymentMethods.forEach(method => {
      const option = document.createElement('option');
      option.value = method.id || method.id_metodo; // Manejar diferentes nombres de propiedad
      option.textContent = method.nombre || method.tipo;
      option.dataset.methodName = method.nombre || method.tipo; // Guardar nombre para referencia
      select.appendChild(option);
    });
    
    // Verificar que los valores se han establecido correctamente
    console.log('Opciones renderizadas:', Array.from(select.options).map(opt => ({
      value: opt.value,
      text: opt.textContent
    })));
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
      await info('Por favor selecciona un método de pago');
      return;
    }

    const selectedMethodName = this.paymentMethods.find(m => m.id == selectedMethod)?.nombre;
    
    // Confirmar la venta antes de procesar
   
    const confirmacion = await confirm(
      'Confirmar Venta',
      `¿Estás seguro de que deseas confirmar la compra ?`
    );

    if (!confirmacion.isConfirmed) {
      return; // El usuario canceló la acción
    }

    try {
      // Obtener el ID del carrito del usuario actual
      const idUsuario = localStorage.getItem('id_usuario');
      if (!idUsuario) {
        alert('Debes iniciar sesión para completar la compra');
        return;
      }

      // Obtener el carrito actual para obtener el ID
 
      const carritoResponse = await get(`carritos/usuario/${idUsuario}`);
      const idCarrito = carritoResponse?.id_carrito || carritoResponse?.data?.id_carrito;

      if (!idCarrito) {
        alert('No se pudo obtener el carrito de compras');
        return;
      }

      // Preparar datos para la venta
      const ventaData = {
        id_carrito: idCarrito,
        id_metodo: parseInt(selectedMethod),
        id_estado_venta: 1
      };
      console.log('Datos de la venta:', ventaData);
      // Realizar POST a ventas

      const response = await post('ventas', ventaData);

      console.log('Venta procesada exitosamente:', response);
      
      // Cerrar modal
      this.hide();
      
      // Mostrar confirmación de éxito
      const { success } = await import('../../utils/alert.js');
      await success('¡Compra realizada exitosamente!');
      
      // carrito después de la compra
      try {
        await put(`carritos/${idCarrito}`, { estado: 'Cerrado', id_usuario: parseInt(idUsuario)});
      } catch (error) {
        console.warn('Error al limpiar carrito:', error);
      }
      
      // Recargar la página para reflejar los cambios
      window.location.reload();
      
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      
      // Mostrar error al usuario
      const { error: showError } = await import('../../utils/alert.js');
      await showError({
        message: 'Error al procesar la compra: ' + (error.message || 'Error desconocido')
      });
    }
  }

  destroy() {
    if (this.modal) {
      this.modal.remove();
    }
  }
  // Crear íconos de Lucide
  
}
if (window.lucide) {
  lucide.createIcons();
}
