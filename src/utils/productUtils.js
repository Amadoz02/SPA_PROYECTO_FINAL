import {createInfoButton} from '../utils/modalUtils.js';
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
                headers: { 'Content-Type': 'application/json' },
                body: esFavorito ? JSON.stringify(favorito) : undefined
            };

            const response = await fetch(url, options);
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

  // Contenedor para la cantidad (nuevo)
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
  quantityInput.max = producto.stock || 1; // Usar el stock del producto
  
  // Botón aumentar
  const increaseBtn = document.createElement('button');
  increaseBtn.className = 'quantity-btn';
  increaseBtn.textContent = '+';

  // Eventos para los botones de cantidad
  decreaseBtn.addEventListener('click', () => {
    if(parseInt(quantityInput.value) > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
    }
  });
  
  increaseBtn.addEventListener('click', () => {
    if(parseInt(quantityInput.value) < producto.stock) {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    }
  });

  // Validar input manual
  quantityInput.addEventListener('change', () => {
    if(quantityInput.value < 1) quantityInput.value = 1;
    if(quantityInput.value > producto.stock) quantityInput.value = producto.stock;
  });

  // Añadir elementos al contenedor
  cantidadContainer.append(decreaseBtn, quantityInput, increaseBtn);
  // Contenedor superior (favorito + info)
  // Contenedor de botones superiores
  const topButtons = document.createElement('div');
  topButtons.className = 'card-top-buttons';
  // Agregar botón de información (arriba a la izquierda)
  topButtons.appendChild(createInfoButton(producto));
  
  // Agregar botón de favoritos (arriba a la derecha)
  topButtons.appendChild(crearBotonFavorito(producto, esFavorito, idUsuario));
  
  card.appendChild(topButtons);
  card.append(
    crearCarruselImagenes(producto),
    crearElemento('h2', 'product-card__title', producto.nombre),
    // Mostrar stock disponible (opcional)
    crearElemento('p', 'product-card__size textPrim', `Talla: ${producto.talla || 'N/A'}`),
    crearElemento('p', 'product-card__gender textPrim', `Género: ${producto.genero || 'N/A'}`),
    crearElemento('p', 'product-card__price', `$${producto.precio || '0'}`),
    // ... otros elementos
    cantidadContainer, // Añadir el selector de cantidad
    crearElemento('button', 'product-card__btn btn', 'Agregar')
  );
  card.querySelector('.product-card__btn').dataset.id = producto.id_producto;
  // Añadir atributo data-stock al botón "Agregar"

  return card;
}


function crearElemento(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
}
