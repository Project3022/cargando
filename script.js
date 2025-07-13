import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const selectEstado = document.getElementById("select-filtro-estado");
  const inputBusqueda = document.getElementById("buscador");

  let productos = [];

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

  async function cargarTodosLosProductos() {
    container.innerHTML = '<p>Cargando productos...</p>';

    const { data, error } = await supabase.from('Productos').select('*').range(0, 19)
;
    if (error) {
      container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
      return;
    }

    productos = data || [];
    if (productos.length === 0) {
      container.innerHTML = '<p>No hay productos publicados.</p>';
      return;
    }

    productos.sort(() => Math.random() - 0.5);
    container.innerHTML = '';

    productos.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';
      let imagenUrls = [];
      if (p.imagen_url) {
        imagenUrls = p.imagen_url.split(',').map(url => url.trim());
      }

      const div = document.createElement('div');
      div.classList.add('product-card', estadoClass);
      div.dataset.estado = estadoClass;
      div.dataset.titulo = p.titulo;

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
    // Click en la tarjeta (excepto botón compartir)
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('share-button')) return; // Ignorar clicks en botón compartir

      const titulo = card.dataset.titulo;
      const producto = productos.find(p => p.titulo === titulo);
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

      // Mostrar solo la primera imagen al principio
      modalImg.src = imagenes.length > 0 ? imagenes[0] : '';
modalImg.style.cursor = 'zoom-in';
modalImg.addEventListener('click', () => {
  document.getElementById('img-grande').src = modalImg.src;
  document.getElementById('visor-img-grande').style.display = 'flex';
});

      // Crear miniaturas
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

    // Click en botón compartir
    const shareBtn = card.querySelector('.share-button');
    if (shareBtn) {
      shareBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // evitar que abra el modal

        const titulo = card.dataset.titulo;
        const producto = productos.find(p => p.titulo === titulo);
        if (!producto) return;

        const precioFormateado = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(producto.precio);
        const urlProducto = window.location.href; // Cambia si tienes url real de producto

        const textoCompartir = `Mira este producto: ${producto.titulo} por ${precioFormateado}. Más info aquí: ${urlProducto}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: producto.titulo,
              text: textoCompartir,
              url: urlProducto,
            });
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
document.getElementById('cerrar-visor').addEventListener('click', () => {
  document.getElementById('visor-img-grande').style.display = 'none';
});


  // Filtros
  selectEstado?.addEventListener("change", aplicarFiltros);
  inputBusqueda?.addEventListener("input", aplicarFiltros);

  cargarTodosLosProductos();

  // Menú lateral
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

  // Submenú de botones
  const buttons = document.querySelectorAll('.submenu-buttons button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const targetPage = button.getAttribute('data-url');
      window.location.href = targetPage;
    });
  });

  // Enlace activo
  const enlaces = document.querySelectorAll(".side-menu a");
  const paginaActual = window.location.pathname.split("/").pop();
  enlaces.forEach(enlace => {
    if (enlace.getAttribute("href")?.includes(paginaActual)) {
      enlace.classList.add("active");
    }
  });

  // Modal close
  const modal = document.getElementById('modal');
  const closeModal = document.querySelector('.close-modal');
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
});
document.getElementById('toggle-darkmode').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

