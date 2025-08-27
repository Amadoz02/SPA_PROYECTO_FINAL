// comprascontroller.js
import { API_BASE_URL } from '../../../utils/manejo_api_optimizado.js';
import { error as alertError } from '../../../utils/alert.js';

export default function comprascontroller() {
  const idUser = Number(sessionStorage.getItem('id_usuario'));
  // Elementos del DOM
  const $list = document.getElementById('comprasList');
  const $no = document.getElementById('noCompras');
  const $spinner = document.getElementById('loadingSpinner');
  const $modal = document.getElementById('compraModal');
  const $modalDetails = document.getElementById('compraDetails');
  const $prev = document.getElementById('prevPage');
  const $next = document.getElementById('nextPage');
  const $pageInfo = document.getElementById('pageInfo');
  const $pagination = document.getElementById('pagination');
  if (!$list || !$no || !$spinner || !$modal || !$modalDetails || !$prev || !$next || !$pageInfo || !$pagination) {
    console.error('[Compras] Faltan elementos del DOM requeridos en la vista');
    return;
  }
  const base = (API_BASE_URL || '').replace(/\/$/, '');
  let compras = [];
  let page = 1;
  const perPage = 5;
  const detallesCache = {};
  cargarCompras();
  bindEvents();
  async function cargarCompras() {
    toggleLoading(true);
    try {
      const res = await fetch(`${base}/ventas/usuario/${idUser}`);
      if (!res.ok) throw new Error('Error al cargar compras');
      const json = await res.json();
      compras = Array.isArray(json) ? json : [];
      renderCompras();
    } catch (err) {
      $no.style.display = 'block';
      $list.innerHTML = '';
      $pagination.style.display = 'none';
      alertError('No se pudieron cargar las compras.');
    } finally {
      toggleLoading(false);
    }
  }
  function renderCompras() {
    if (!compras.length) {
      $no.style.display = 'block';
      $list.innerHTML = '';
      $pagination.style.display = 'none';
      return;
    }
    $no.style.display = 'none';
    $pagination.style.display = 'block';
    $list.innerHTML = '';
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageCompras = compras.slice(start, end);
    pageCompras.forEach(compra => {
      const div = document.createElement('div');
      div.className = 'compra-item';
      div.textContent = `Compra #${compra.id_venta} - ${compra.fecha}`;
      div.onclick = () => mostrarDetalles(compra.id_venta);
      $list.appendChild(div);
    });
    $pageInfo.textContent = `Página ${page} de ${Math.ceil(compras.length / perPage)}`;
    $prev.disabled = page === 1;
    $next.disabled = end >= compras.length;
  }
  function bindEvents() {
    $prev.onclick = () => { if (page > 1) { page--; renderCompras(); } };
    $next.onclick = () => { if ((page * perPage) < compras.length) { page++; renderCompras(); } };
    $modal.onclick = (e) => { if (e.target === $modal) $modal.style.display = 'none'; };
  }
  function mostrarDetalles(idVenta) {
    if (detallesCache[idVenta]) {
      $modalDetails.innerHTML = detallesCache[idVenta];
      $modal.style.display = 'block';
      return;
    }
    fetch(`${base}/ventas/${idVenta}`)
      .then(res => res.json())
      .then(det => {
        const html = `<h3>Detalles de la compra</h3><pre>${JSON.stringify(det, null, 2)}</pre>`;
        detallesCache[idVenta] = html;
        $modalDetails.innerHTML = html;
        $modal.style.display = 'block';
      })
      .catch(() => {
        $modalDetails.innerHTML = '<p>Error al cargar detalles.</p>';
        $modal.style.display = 'block';
      });
  }
  function toggleLoading(show) {
    $spinner.style.display = show ? 'block' : 'none';
  }
}
