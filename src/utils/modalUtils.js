// utils/modalUtils.js

/**
 * Crea y muestra un modal con información del producto
 * @param {Object} product - Objeto del producto con todos los detalles
 */
export function showProductModal(product) {
  // Crear elementos del modal
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Contenido del modal
  modalContent.innerHTML = `
    <button class="modal-close">
      <i data-lucide="x"></i>
    </button>
    <h3 class="modal-title">${product.nombre || 'Detalles del producto'}</h3>

    <div class="modal-details">
      <p><strong>Descripción:</strong> ${product.descripcion || 'No disponible'}</p>
      <p><strong>Precio:</strong> $${product.precio || '0'}</p>
      <p><strong>Categoría:</strong> ${product.categoria || 'N/A'}</p>
      <p><strong>Talla:</strong> ${product.talla || 'N/A'}</p>
      <p><strong>Género:</strong> ${product.genero || 'N/A'}</p>
      <p><strong>Stock disponible:</strong> ${product.stock || '0'}</p>
    </div>
  `;
  
  // Ensamblar modal
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  document.body.style.overflow = 'hidden';

  // Configurar cierre del modal
  const closeBtn = modalContent.querySelector('.modal-close');
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Crear íconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  function closeModal() {
    modalOverlay.remove();
    document.body.style.overflow = '';
  }
}

/**
 * Crea un botón de información para la tarjeta de producto
 * @param {Object} product - Objeto del producto
 * @returns {HTMLButtonElement} Botón de información
 */
export function createInfoButton(product) {
  const btn = document.createElement('button');
  btn.className = 'info-button';
  btn.innerHTML = `
    <i data-lucide="info" class="info-icon"></i>
  `;
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    showProductModal(product);
  });

  return btn;
}
