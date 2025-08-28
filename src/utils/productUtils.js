import {createInfoButton} from '../utils/modalUtils.js';
import favoritosController from '../controllers/favoritosController.js';
// utils/productUtils.js
export function crearBotonFavorito(producto, esFavorito, idUsuario) {
    const btn = document.createElement('button');
    btn.className = `product-card__favorite${esFavorito ? ' product-card__favorite--active' : ''}`;
    btn.setAttribute('aria-label', 'Agregar a favoritos');
    btn.innerHTML = '<i data-lucide="heart" class="product-card__favorite-icon"></i>';
    btn.dataset.productId = producto.id_producto;

    btn.addEventListener('click', async () => {
        const idProducto = btn.dataset.productId;

        if (!idProducto || !idUsuario) {
            console.error('Faltan datos para guardar/eliminar favorito');
            return;
        }

        const favorito = {
            idUsuario: parseInt(idUsuario),
            idProducto: parseInt(idProducto)
        };

        btn.classList.toggle('product-card__favorite--active');

        const esFavorito = btn.classList.contains('product-card__favorite--active');

        try {
            const url = `http://localhost:8080/helder/api/favoritos${esFavorito ? '' : `/${idUsuario}/${idProducto}`}`;
            const options = {
                method: esFavorito ? 'POST' : 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
                },
                body: esFavorito ? JSON.stringify(favorito) : undefined
            };

            const response = await fetch(url, options);
            window.actualizarContadores();
            if (location.hash === '#favoritos') {
                
                favoritosController(); // Recargar favoritos si estamos en la vista de favoritos
              
            }
            if (!response.ok) throw new Error(`${esFavorito ? 'Agregar' : 'Eliminar'} favorito falló`);
            console.log(`Producto ${esFavorito ? 'agregado a' : 'eliminado de'} favoritos:`, idProducto);
        } catch (error) {
            console.error('Error al actualizar favoritos:', error);
        }
    });

    return btn;
}

export function crearCarruselImagenes(producto) {
    const container = document.createElement('div');
    container.className = 'product-card__carousel';
    const img = document.createElement('img');
    img.className = 'product-card__img';
    let index = 0;

    function actualizarImagen() {
        const imgData = producto.imagenes?.[index];
        img.src = imgData?.url_imagen || '../resources/img1.jpg';
        img.alt = imgData?.descripcion || producto.nombre || 'Producto';
    }

    actualizarImagen();
    container.appendChild(img);

    if (producto.imagenes?.length > 1) {
        const crearBtn = (text, dir) => {
            const btn = document.createElement('button');
            btn.className = `carousel-btn carousel-btn--${dir}`;
            btn.setAttribute('aria-label', `Imagen ${dir === 'next' ? 'siguiente' : 'anterior'}`);
            btn.textContent = dir === 'next' ? '>' : '<';
            btn.addEventListener('click', () => {
                index = (index + (dir === 'next' ? 1 : -1) + producto.imagenes.length) % producto.imagenes.length;
                actualizarImagen();
            });
            return btn;
        };
        container.append(crearBtn('<', 'prev'), crearBtn('>', 'next'));
    }

    return container;
}



export function crearCardProducto(producto, esFavorito, idUsuario) {
  const card = document.createElement('article');
  card.className = 'product-card';

  // Contenedor para tallas
  const tallasContainer = document.createElement('div');
  tallasContainer.className = 'product-card__tallas';
  

  // Contenedor de radio buttons para tallas
  const tallasRadioContainer = document.createElement('div');
  tallasRadioContainer.className = 'product-card__tallas-radio';

  // Variable para almacenar la talla seleccionada
  let tallaSeleccionada = null;
  let stockDisponible = 0;

  // Crear radio buttons para cada talla
  if (producto.tallas && producto.tallas.length > 0) {
    producto.tallas.forEach((tallaInfo, index) => {
      const radioWrapper = document.createElement('label');
      radioWrapper.className = 'talla-radio-label';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `talla-${producto.id_producto}`;
      radio.value = tallaInfo.id_talla;
      radio.className = 'talla-radio';
      radio.dataset.talla = tallaInfo.id_talla_producto;
      radio.dataset.stock = tallaInfo.stock;
      
      // Seleccionar la primera talla por defecto si tiene stock
      if (index === 0 && tallaInfo.stock > 0) {
        radio.checked = true;
        tallaSeleccionada = tallaInfo.id_talla_producto;
        stockDisponible = tallaInfo.stock;
      }
      
      // Deshabilitar si no hay stock
      if (tallaInfo.stock === 0) {
        radio.disabled = true;
        radioWrapper.classList.add('talla-agotada');
      }
      
      const tallaText = document.createElement('span');
      tallaText.className = 'talla-text';
      tallaText.textContent = tallaInfo.talla;
      
      radioWrapper.appendChild(radio);
      radioWrapper.appendChild(tallaText);
      tallasRadioContainer.appendChild(radioWrapper);
    });
  } else {
    tallasRadioContainer.innerHTML = '<span class="textPrim">Sin tallas disponibles</span>';
  }

  tallasContainer.appendChild(tallasRadioContainer);

  // Contenedor para la cantidad
  const cantidadContainer = document.createElement('div');
  cantidadContainer.className = 'product-card__quantity';
  
  // Botón disminuir
  const decreaseBtn = document.createElement('button');
  decreaseBtn.className = 'quantity-btn';
  decreaseBtn.textContent = '-';
  
  // Input cantidad
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.className = 'quantity-input';
  quantityInput.value = 1;
  quantityInput.min = 1;
  quantityInput.max = stockDisponible || 1;
  
  // Botón aumentar
  const increaseBtn = document.createElement('button');
  increaseBtn.className = 'quantity-btn';
  increaseBtn.textContent = '+';

  // Función para actualizar el stock máximo
  function actualizarStockMaximo(stock) {
    quantityInput.max = stock;
    if (parseInt(quantityInput.value) > stock) {
      quantityInput.value = stock || 1;
    }
    
    // Deshabilitar botones si no hay stock
    decreaseBtn.disabled = stock <= 1;
    increaseBtn.disabled = stock <= 1;
  }

  // Eventos para los botones de cantidad
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    const maxStock = parseInt(quantityInput.max);
    if (currentValue < maxStock) {
      quantityInput.value = currentValue + 1;
    }
  });

  // Validar input manual
  quantityInput.addEventListener('change', () => {
    const maxStock = parseInt(quantityInput.max);
    if (quantityInput.value < 1) quantityInput.value = 1;
    if (quantityInput.value > maxStock) quantityInput.value = maxStock;
  });

  // Event listener para cambio de talla
  tallasRadioContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('talla-radio')) {
      const stock = parseInt(e.target.dataset.stock);
      tallaSeleccionada = parseInt(e.target.value);
      stockInfo.textContent = `Stock: ${stock} unidades`;
      actualizarStockMaximo(stock);
    }
  });

  // Añadir elementos al contenedor
  cantidadContainer.append(decreaseBtn, quantityInput, increaseBtn);

  // Contenedor de stock disponible
  const stockInfo = document.createElement('p');
  stockInfo.className = 'product-card__stock textPrim';
  stockInfo.textContent = `Stock: ${stockDisponible} unidades`;

  // Contenedor superior (favorito + info)
  const topButtons = document.createElement('div');
  topButtons.className = 'card-top-buttons';
  topButtons.appendChild(createInfoButton(producto));
  topButtons.appendChild(crearBotonFavorito(producto, esFavorito, idUsuario));
  
  card.appendChild(topButtons);
  card.append(
    crearCarruselImagenes(producto),
    crearElemento('h2', 'product-card__title', producto.nombre),
    crearElemento('p', 'product-card__gender textPrim', `Género: ${producto.genero || 'N/A'}`),
    crearElemento('p', 'product-card__price', `$${producto.precio || '0'}`),
    tallasContainer,
    stockInfo,
    cantidadContainer,
    crearElemento('button', 'product-card__btn btn', 'Agregar')
  );
  
  const agregarBtn = card.querySelector('.product-card__btn');
  agregarBtn.dataset.id = producto.id_producto;
  agregarBtn.dataset.talla = tallaSeleccionada || '';

  // Actualizar stock inicial
  actualizarStockMaximo(stockDisponible);

  return card;
}


function crearElemento(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
}
