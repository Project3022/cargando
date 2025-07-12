// merged-main.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const selectEstado = document.getElementById("select-filtro-estado");
  const inputBusqueda = document.getElementById("buscador");

  const aplicarFiltros = () => {
    const estadoSeleccionado = selectEstado?.value.toLowerCase() || "todos";
    const textoBusqueda = inputBusqueda?.value.toLowerCase() || "";

    const productos = document.querySelectorAll(".product-card");

    productos.forEach(producto => {
      const claseEstado = producto.classList.contains("nuevo") ? "nuevo" :
                          producto.classList.contains("usado") ? "usado" : "otro";
      const titulo = producto.querySelector(".titulo").textContent.toLowerCase();
      const descripcion = producto.querySelector(".descripcion").textContent.toLowerCase();

      const coincideEstado = estadoSeleccionado === "todos" || claseEstado === estadoSeleccionado;
      const coincideTexto = titulo.includes(textoBusqueda) || descripcion.includes(textoBusqueda);

      producto.style.display = (coincideEstado && coincideTexto) ? "block" : "none";
    });
  };

  async function cargarTodosLosProductos() {
    container.innerHTML = '<p>Cargando productos...</p>';

    const { data: productos, error } = await supabase.from('Productos').select('*');

    if (error) {
      container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
      return;
    }
    if (!productos || productos.length === 0) {
      container.innerHTML = '<p>No hay productos publicados.</p>';
      return;
    }

    productos.sort(() => Math.random() - 0.5);

    container.innerHTML = '';

    productos.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

      const descripcionCorta = p.descripcion.length > 10 ? p.descripcion.slice(0, 100) + '...' : p.descripcion;
      const descripcionCompleta = p.descripcion;

      let imagenUrls = [];
      if (p.imagen_url) {
        imagenUrls = p.imagen_url.split(',').map(url => url.trim());
      }

      const phoneNumber = p.whatsapp || "8292308873";

      const div = document.createElement('div');
      div.classList.add('product-card', estadoClass);
      div.dataset.estado = estadoClass;

      const precioFormateado = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(p.precio);

      div.innerHTML = `
        <h3 class="titulo">${p.titulo}</h3>
        <div class="imagenes-producto">
          ${imagenUrls.length > 0
            ? `<img src="${imagenUrls[0]}" alt="${p.titulo}" class="product-image" loading="lazy" data-images='${JSON.stringify(imagenUrls)}' />`
            : `<img src="https://via.placeholder.com/300?text=Sin+imagen" alt="${p.titulo}" />`}
        </div>
     <p class="descripcion">
  <span class="short-desc">${descripcionCorta}</span>
  <span class="full-desc">${descripcionCompleta}</span>
  ${p.descripcion.length > 10 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
</p>

        <p><strong>Precio:</strong> <span class="precio">${precioFormateado}</span></p>
        <p><strong>Estado:</strong> ${p.estado}</p>
        <p><strong>Vendedor:</strong> ${p.vendedor}</p>
        <button class="buy-button" data-whatsapp="${phoneNumber}">💵 Comprar</button>
      `;

      container.appendChild(div);
    });

    activarToggleDescripcion();
    activarBotonesComprar();
    aplicarFiltros();
  }

function activarToggleDescripcion() {
  document.querySelectorAll('.toggle-desc').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const desc = btn.closest('.descripcion');
      if (!desc) return;
      desc.classList.toggle('expanded');
      btn.textContent = desc.classList.contains('expanded') ? 'Ver menos' : 'Ver más';
    });
  });
}

  function activarBotonesComprar() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();

        const productCard = e.target.closest('.product-card');
        const title = productCard.querySelector('.titulo').textContent.trim();
        const price = productCard.querySelector('.precio').textContent.trim();
        const description = productCard.querySelector('.full-desc').textContent.trim();
        const phoneNumber = e.target.dataset.whatsapp || "8292308873";

        const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${title}\n- Precio: ${price}\n- Descripción: ${description}`;
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsapp, '_blank');
      });
    });
  }

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
});

// Lightbox

document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.querySelector(".lightbox-image");
  const closeBtn = document.querySelector(".close-btn");

  let currentImages = [];
  let currentIndex = 0;

  document.addEventListener("click", e => {
    const img = e.target.closest(".product-image");
    if (!img) return;

    try {
      currentImages = JSON.parse(img.dataset.images);
    } catch {
      currentImages = [img.src];
    }

    currentIndex = 0;
    lightboxImg.src = currentImages[currentIndex];
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
    document.body.style.overflow = "";
  });

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox || e.target === closeBtn) {
      lightbox.style.display = "none";
      document.body.style.overflow = "";
    } else if (e.target === lightboxImg && currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    }
  });

  document.addEventListener("keydown", e => {
    if (lightbox.style.display !== "flex") return;

    if (e.key === "ArrowRight" || e.key === "d") {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    } else if (e.key === "Escape") {
      lightbox.style.display = "none";
      document.body.style.overflow = "";
    }
  });
});
