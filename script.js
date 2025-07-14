import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

if (localStorage.getItem('modoOscuro') === 'activo') {
  document.body.classList.add('dark');
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const selectEstado = document.getElementById("select-filtro-estado");
  const inputBusqueda = document.getElementById("buscador");
  let productos = [];
  let pagina = 0;
  const limitePorPagina = 20;
  let cargando = false;
  let finDeProductos = false;

const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('producto');

if (productoId) {
  const esperarCarga = setInterval(() => {
    const producto = productos.find(p => p.id == productoId);
    if (producto) {
      clearInterval(esperarCarga);
      const card = document.querySelector(`.product-card[data-id="${productoId}"]`);
      if (card) card.click();  // simula el click para abrir el modal
    }
  }, 300);
}




  const aplicarFiltros = () => {
    const estadoSeleccionado = selectEstado?.value.toLowerCase() || "todos";
    const textoBusqueda = inputBusqueda?.value.toLowerCase() || "";

    const cards = document.querySelectorAll(".product-card");
    cards.forEach(producto => {
      const claseEstado = producto.classList.contains("nuevo") ? "nuevo" :
                          producto.classList.contains("usado") ? "usado" : "otro";
      const titulo = producto.querySelector(".titulo").textContent.toLowerCase();
      const coincideEstado = estadoSeleccionado === "todos" || claseEstado === estadoSeleccionado;
      const coincideTexto = titulo.includes(textoBusqueda);
      producto.style.display = (coincideEstado && coincideTexto) ? "block" : "none";
    });
  };

  async function cargarProductosScroll() {
    if (cargando || finDeProductos) return;
    cargando = true;

    for (let i = 0; i < 4; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      skeleton.innerHTML = `
        <div class="skeleton-img"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      `;
      container.appendChild(skeleton);
    }

    const desde = pagina * limitePorPagina;
    const hasta = desde + limitePorPagina - 1;

    const { data, error } = await supabase.from('Productos').select('*').range(desde, hasta);

    document.querySelectorAll('.skeleton-card').forEach(el => el.remove());

    if (error) {
      container.innerHTML += `<p>Error cargando productos: ${error.message}</p>`;
      cargando = false;
      return;
    }

    if (!data || data.length === 0) {
      finDeProductos = true;
      if (pagina === 0) container.innerHTML = '<p>No hay productos.</p>';
      return;
    }

const dataMezclada = mezclarArray(data);
productos = productos.concat(dataMezclada);
mostrarProductos(dataMezclada);

    pagina++;
    cargando = false;
  }

function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}



  function mostrarProductos(lista) {
    const categoria = window.categoria || 'inicio';
    const productosFiltrados = categoria === 'inicio' ? lista : lista.filter(p => p.categoria === categoria);

    productosFiltrados.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';
      let imagenUrls = p.imagen_url ? p.imagen_url.split(',').map(url => url.trim()) : [];

      const div = document.createElement('div');
      div.classList.add('product-card', estadoClass);
      div.dataset.estado = estadoClass;
      div.dataset.titulo = p.titulo;
      div.dataset.id = p.id;

      const precioFormateado = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(p.precio);

      div.innerHTML = `
        <div class="imagenes-producto">
          ${imagenUrls.length > 0
            ? `<img src="${imagenUrls[0]}" alt="${p.titulo}" class="product-image" loading="lazy" />`
            : `<img src="https://via.placeholder.com/300?text=Sin+imagen" alt="${p.titulo}" />`}
        </div>
        <span class="badge ${estadoClass}">${p.estado}</span>
        <h3 class="titulo">${p.titulo}</h3>
        <p class="precio">${precioFormateado}</p>
        <button class="share-button" title="Compartir producto">📤 Compartir</button>
      `;

      container.appendChild(div);
    });

    activarClickProducto();
    aplicarFiltros();
  }

  function activarClickProducto() {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('share-button')) return;

        const id = card.dataset.id;
        const producto = productos.find(p => p.id == id);
        if (!producto) return;

        let imagenes = producto.imagen_url ? producto.imagen_url.split(',').map(i => i.trim()) : [];

        document.getElementById('modal-titulo').textContent = producto.titulo;
        document.getElementById('modal-precio').textContent = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(producto.precio);
        document.getElementById('modal-descripcion').textContent = producto.descripcion;
        document.getElementById('modal-estado').textContent = producto.estado;
        document.getElementById('modal-vendedor').textContent = producto.vendedor;

        const modalImg = document.getElementById('modal-img');
        const galeria = document.getElementById('modal-galeria');
        galeria.innerHTML = '';

        modalImg.src = imagenes.length > 0 ? imagenes[0] : '';
        modalImg.style.cursor = 'zoom-in';
        modalImg.addEventListener('click', () => {
          document.getElementById('img-grande').src = modalImg.src;
          document.getElementById('visor-img-grande').style.display = 'flex';
        });

        imagenes.forEach((src, index) => {
          const mini = document.createElement('img');
          mini.src = src;
          mini.className = 'modal-img-mini';
          mini.style.width = '60px';
          mini.style.height = '60px';
          mini.style.objectFit = 'cover';
          mini.style.borderRadius = '6px';
          mini.style.cursor = 'pointer';
          mini.style.border = index === 0 ? '2px solid #25d366' : '2px solid transparent';

          mini.addEventListener('click', () => {
            modalImg.src = src;
            document.querySelectorAll('.modal-img-mini').forEach(m => m.style.border = '2px solid transparent');
            mini.style.border = '2px solid #25d366';
          });

          galeria.appendChild(mini);
        });

        document.getElementById('modal-link').href = `https://api.whatsapp.com/send?phone=${producto.whatsapp || "8292308873"}&text=${encodeURIComponent(`Hola, estoy interesado en ${producto.titulo} por ${producto.precio}`)}`;

        document.getElementById('modal').style.display = 'flex';
        document.body.style.overflow = "hidden";
      });

      const shareBtn = card.querySelector('.share-button');
      if (shareBtn) {
        shareBtn.addEventListener('click', async (e) => {
          e.stopPropagation();

          const titulo = card.dataset.titulo;
          const producto = productos.find(p => p.titulo === titulo);
          if (!producto) return;

          const precioFormateado = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(producto.precio);
         const urlProducto = `${window.location.origin}${window.location.pathname}?producto=${producto.id}`;
          const textoCompartir = `Mira este producto: ${producto.titulo} por ${precioFormateado}. Más info aquí: ${urlProducto}`;

          if (navigator.share) {
            try {
              await navigator.share({ title: producto.titulo, text: textoCompartir, url: urlProducto });
            } catch (error) {
              console.error('Error compartiendo:', error);
            }
          } else {
            try {
              await navigator.clipboard.writeText(textoCompartir);
              alert('Texto del producto copiado al portapapeles para compartir.');
            } catch (error) {
              alert('No se pudo copiar el texto para compartir.');
            }
          }
        });
      }
    });
  }

  if (selectEstado) selectEstado.addEventListener("change", aplicarFiltros);
  if (inputBusqueda) inputBusqueda.addEventListener("input", aplicarFiltros);

  cargarProductosScroll();

  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
      cargarProductosScroll();
    }
  });

  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  if (menuToggle && sideMenu) {
    menuToggle.addEventListener('click', e => {
      e.stopPropagation();
      sideMenu.classList.toggle('open');
    });

    document.addEventListener('click', e => {
      if (!sideMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        sideMenu.classList.remove('open');
      }
    });
  }

  const buttons = document.querySelectorAll('.submenu-buttons button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const targetPage = button.getAttribute('data-url');
      window.location.href = targetPage;
    });
  });

  const enlaces = document.querySelectorAll(".side-menu a");
  const paginaActual = window.location.pathname.split("/").pop();

  enlaces.forEach(enlace => {
    const href = enlace.getAttribute("href");
    if (href) {
      const nombreEnlace = href.split("/").pop();
      if (nombreEnlace === paginaActual) {
        enlace.classList.add("active");
      }
    }
  });

  const modal = document.getElementById('modal');
  const closeModal = document.querySelector('.close-modal');
  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = "";
    });

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = "";
      }
    });
  }

  const cerrarVisor = document.getElementById('cerrar-visor');
  if (cerrarVisor) {
    cerrarVisor.addEventListener('click', () => {
      document.getElementById('visor-img-grande').style.display = 'none';
    });
  }

  const btnDarkMode = document.getElementById('toggle-darkmode');
  if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      if (document.body.classList.contains('dark')) {
        localStorage.setItem('modoOscuro', 'activo');
      } else {
        localStorage.setItem('modoOscuro', 'inactivo');
      }
    });
  }
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Evita que el navegador muestre el banner por defecto
  deferredPrompt = e;
  console.log('👍 Evento beforeinstallprompt capturado');



  document.getElementById('btn-install').style.display = 'block';
  // Mostrar un botón personalizado, por ejemplo:
  const btnInstalar = document.getElementById('btn-instalar');
  if (btnInstalar) {
    btnInstalar.style.display = 'block';
    btnInstalar.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ Usuario aceptó la instalación');
          } else {
            console.log('❌ Usuario rechazó la instalación');
          }
          deferredPrompt = null;
        });
      }
    });
  }
});

