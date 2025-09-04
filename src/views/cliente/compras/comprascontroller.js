// comprasController.js
import { API_BASE_URL } from '../../../utils/manejo_api_optimizado.js';
import { error as alertError } from '../../../utils/alert.js';
import { get } from '../../../utils/manejo_api_optimizado.js';
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

const idUser = Number(localStorage.getItem('id_usuario'));


export default async function comprasController(id_usuario = idUser, ids = null) {

  // Elementos del DOM
  console.log("Iniciando comprasController con id_usuario:", id_usuario, "ids:", ids);
  const $list = document.getElementById('comprasList');
  const $no = document.getElementById('noCompras');
  const $spinner = document.getElementById('loadingSpinner');
  const $modal = document.getElementById('compraModal');
  const $modalDetails = document.getElementById('compraDetails');
  const $prev = document.getElementById('prevPage');
  const $next = document.getElementById('nextPage');
  const $pageInfo = document.getElementById('pageInfo');
  const $pagination = document.getElementById('pagination');
  // Guardas de DOM
  if (!$list || !$no || !$spinner || !$modal || !$modalDetails || !$prev || !$next || !$pageInfo || !$pagination) {
    console.error('[Compras] Faltan elementos del DOM requeridos en la vista');
    return;
  }

  // Estado
  const base = (API_BASE_URL || '').replace(/\/$/, '');
  
  // if (!Number.isFinite(id_usuario)) {
  //   alertError('Debes iniciar sesión para ver compras/ventas');
  //   return;
  // }

  let compras = [];
  let page = 1;
  const perPage = 4;
  const detallesCache = {};

  // Init
  cargarCompras();
  bindEvents();
async function cargarCompras() {
  toggleLoading(true);
  try {
    if (Array.isArray(ids) && ids.length > 0) {
      compras = [];
      for (const id of ids) {
        const comprasUsuarios = await get(`ventas/usuario/${id}`);
        console.log("Compras del usuario", comprasUsuarios);
        const comprasUsuario = Array.isArray(comprasUsuarios)
          ? comprasUsuarios.map(c => ({ ...c, id_usuario: id }))
          : [];
        compras.push(...comprasUsuario);
      }
    } else if (id_usuario && !isNaN(id_usuario)) {
      const comprasUsuario = await get(`ventas/usuario/${id_usuario}`);
      console.log("Compras del usuario", comprasUsuario);
      compras = Array.isArray(comprasUsuario) ? comprasUsuario : [];
    } else {
      console.warn("ID de usuario no válido:", id_usuario);
      compras = [];
    }

    page = 1;
    console.log("Compras cargadas:", compras);
    renderCompras();
  } catch (e) {
    console.error(e);
    alertError('No se pudieron cargar las compras');
    compras = [];
    renderCompras();
  } finally {
    toggleLoading(false);
  }
}


  function renderCompras() {
    if (!compras.length) {
      $list.innerHTML = '';
      $no.style.display = 'block';
      $pagination.style.display = 'none';
      return;
    }

    $no.style.display = 'none';

    const totalPages = Math.max(1, Math.ceil(compras.length / perPage));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * perPage;
    const slice = compras.slice(start, start + perPage);

    $list.innerHTML = slice.map(cardHTML).join('');

    // Paginación
    $pagination.style.display = totalPages > 1 ? 'flex' : 'none';
    $pageInfo.textContent = `Página ${page} de ${totalPages}`;
    $prev.disabled = page === 1;
    $next.disabled = page === totalPages;
  }

  function cardHTML(c) {
    const fecha = formatDate(c.fecha);
    const total = formatMoney(c.total);
    const metodo = c?.metodoPago?.nombre || '—';

    const estado = c?.id_estado_venta || '—';
    const id = c?.id_venta ?? c?.id ?? '—';

    return `
      <div class="compra-card">
        <div class="compra-header">
          <span>#${id}</span>
          <span>${fecha}</span>
          <span>${c.estadoVenta.estado}</span>
        </div>
        <div class="compra-body">
          <span>Método: ${metodo}</span>
          <span>Total: ${total}</span>
        </div>
        <div class="compra-footer">
          <button class="btn-ver-detalles" data-id="${id}">Ver detalles</button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    $prev.addEventListener('click', () => {
      if (page > 1) {
        page--;
        renderCompras();
      }
    });

    $next.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(compras.length / perPage));
      if (page < totalPages) {
        page++;
        renderCompras();
      }
    });

    // Delegación para abrir modal
    $list.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-ver-detalles');
      if (!btn) return;
      const id = btn.dataset.id;
      await verDetalles(id);
    });

    // Cerrar modal click fondo o botón .close dentro del contenido
    $modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
        closeModal();
      }
    });
  }

  async function verDetalles(id) {
    if (detallesCache[id]) {
      mostrarModal(detallesCache[id]);
      return;
    }
    toggleLoading(true);
    try {
      let compra = await get(`ventas/${id}`);
      // Si la respuesta es un array, toma el primer elemento
      if (Array.isArray(compra)) {
        compra = compra[0];
      }
      detallesCache[id] = compra;
      console.log("se pasa la comprs", compra);
      mostrarModal(compra);
    } catch (e) {
      console.error(e);
      alertError('No se pudieron cargar los detalles de la compra');
    } finally {
      toggleLoading(false);
    }
  }
 async function obtenerTalla(id) {
   try {
     const talla = await get(`tallas-productos/${id}`);
     console.log("talla", talla);
     return talla;
   } catch (error) {
     console.error("Error al obtener la talla:", error);
     return null;
   }
  
 }
  function mostrarModal(compra) {
    const { usuario, metodoPago } = compra || {};
    // Si la dirección es un array, toma el primer elemento
    let direccion = compra?.direccion;
    if (Array.isArray(direccion)) direccion = direccion[0];
    const productos = Array.isArray(compra?.productos) ? compra.productos : [];
    console.log(compra);

    const subtotalGeneral = productos.reduce((acc, p) => acc + (toNumber(p.precio) * toNumber(p.cantidad)), 0);
    
    (async () => {
      let productosHTML = '';
      if (productos.length) {
        const productosCards = await Promise.all(productos.map(async (p) => {
          const img = Array.isArray(p.imagen) && p.imagen.length
            ? p.imagen[0].url_imagen
            : '../../resources/logo.png';
          const nombre = escapeHTML(p.nombre ?? 'Producto');
          const cant = toNumber(p.cantidad);
          const precio = toNumber(p.subtotal / cant);
          const subtotal = formatMoney(precio * cant);
          let talla = await obtenerTalla(p.id_talla_producto);
          return `
            <div class="producto-item">
              <img src="${img}" alt="${nombre}" class="producto-img" />
              <div class="producto-info">
                <h5>${nombre}</h5>
                <p>Cantidad: ${cant}</p>
                <p>Talla: <strong>${talla?.talla ?? ''}</strong></p>
                <p>Precio unitario: ${formatMoney(precio)}</p>
                <p><strong>Subtotal:</strong> ${subtotal}</p>
              </div>
            </div>
          `;
        }));
        productosHTML = productosCards.join('');
      } else {
        productosHTML = '<p>No hay productos en esta compra</p>';
      }

      $modalDetails.innerHTML = `
        <div class="detalle-compra">
          <div class="detalle-header">
            <button class="modal-close" aria-label="Cerrar">&times;</button>
            <h3>Compra #${compra?.id_venta ?? compra?.id}</h3>
            <span class="detalle-fecha">${formatDate(compra?.fecha)}</span>
          </div>

          <div class="detalle-info">
            <div class="info-item">
              <strong>Estado:</strong> <span>${compra?.estadoVenta.estado ?? '—'}</span>
            </div>
            <div class="info-item">
              <strong>Total:</strong> <span>${formatMoney(toNumber(compra?.total))}</span>
            </div>
          </div>

          <div class="detalle-actor">
            <h4>Usuario</h4>
            <p>${escapeHTML(usuario?.nombre || 'N/A')} (${escapeHTML(usuario?.correo || 'Sin correo')})</p>
          </div>

          <div class="detalle-pago">
            <h4>Método de pago</h4>
            <p>${escapeHTML(metodoPago?.nombre || 'No especificado')}${metodoPago?.detalle ? ` - ${escapeHTML(metodoPago.detalle)}` : ''}</p>
          </div>

          <div class="detalle-direccion">
            <h4>Dirección de envío</h4>
            <p>
              ${escapeHTML(direccion?.direccion || '')}, ${escapeHTML(direccion?.nombre_municipio || '')}, ${escapeHTML(direccion?.departamento || '')}
            </p>
          </div>

          <div class="detalle-productos">
            <h4>Productos</h4>
            <div class="productos-list">
              ${productosHTML}
            </div>
          </div>

          <div class="detalle-subtotal">
            <h4>Subtotal general</h4>
            <p><strong>${formatMoney(subtotalGeneral)}</strong></p>
          </div>

          <div class="detalle-actions">
            <button id="btnExportPdf" class="btn-pdf">📄 Exportar PDF</button>
          </div>
        </div>
      `;
      // Botón PDF
      document.getElementById('btnExportPdf')?.addEventListener('click', () => exportarVentaPdf(compra));
      openModal();
    })();
        }

  function exportarVentaPdf(compra) {
    // Si la dirección es un array, toma el primer elemento
    let direccion = compra?.direccion;
    if (Array.isArray(direccion)) direccion = direccion[0];
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Factura de Compra #${(compra?.id_venta ?? compra?.id)}`, 10, 12);

    doc.setFontSize(12);
    doc.text(`Fecha: ${compra?.fecha}`, 10, 22);
    doc.text(`Usuario: ${compra?.usuario?.nombre || 'N/A'}`, 10, 30);
    doc.text(`Método de pago: ${compra?.metodoPago?.nombre || 'N/A'}`, 10, 38);

    const dirLinea = [
      direccion?.ciudad || '',
      direccion?.departamento || '',
      direccion?.direccion || '',
      direccion?.codigo_postal || '',
    ].filter(Boolean).join(', ');

    doc.text(`Dirección: ${dirLinea || '—'}`, 10, 46);

    // Tabla
    const body = (compra.productos || []).map((p) => [
      String(p.nombre || 'Producto'),
      String(p.cantidad ?? 0),
      formatMoney(toNumber(p.precio)),
      formatMoney(toNumber(p.precio) * toNumber(p.cantidad)),
    ]);

    doc.autoTable({
  startY: 56,
  head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
  body,
  styles: { cellPadding: 2, fontSize: 10, lineColor: [200, 200, 200], lineWidth: 0.2 },
  headStyles: { fillColor: [33, 150, 243], textColor: 255 },
});



    const afterTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 64;
    doc.text(`Total: ${formatMoney(toNumber(compra.total))}`, 10, afterTableY);

    doc.save(`venta_${(compra.id_venta ?? compra.id)}.pdf`);
}



  // Utils
  function toggleLoading(show) {
    $spinner.style.display = show ? 'block' : 'none';
  }
  function openModal() {
    $modal.style.display = 'flex';
  }
  function closeModal() {
  $modal.style.display = 'none';
  $modalDetails.innerHTML = '';
}
  function formatDate(value) {
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleDateString('es-CO');
  }
  function toNumber(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
  }
  function formatMoney(n) {
    return toNumber(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


}



