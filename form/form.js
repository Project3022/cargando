import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.getElementById('product-form');
const submitBtn = document.getElementById('submit-btn');
const spinner = document.getElementById('spinner');
const imageInput = document.getElementById('imagen');
const imagePreview = document.getElementById('imagePreview');
let archivosSeleccionados = [];

imageInput.addEventListener('change', () => {
  archivosSeleccionados = Array.from(imageInput.files);
  mostrarPrevisualizaciones();
});

function mostrarPrevisualizaciones() {
  imagePreview.innerHTML = '';

  archivosSeleccionados.forEach((file, index) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const container = document.createElement('div');
      container.classList.add('preview-container');

      const img = document.createElement('img');
      img.src = e.target.result;

      const btn = document.createElement('button');
      btn.classList.add('remove-btn');
      btn.textContent = '✖';
      btn.onclick = () => {
        archivosSeleccionados.splice(index, 1);
        mostrarPrevisualizaciones();
      };

      container.appendChild(img);
      container.appendChild(btn);
      imagePreview.appendChild(container);
    };

    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Subiendo...';
  spinner.style.display = 'inline-block';

  const titulo = document.getElementById('titulo').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const estado = document.getElementById('estado').value;
  const categoria = document.getElementById('categoria').value;
  const vendedor = document.getElementById('vendedor').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const imagenFiles = archivosSeleccionados;

  if (vendedor.length < 10) {
    alert('El nombre del vendedor debe tener al menos 10 caracteres.');
    resetBoton();
    return;
  }

  if (!imagenFiles || imagenFiles.length === 0) {
    alert('Selecciona al menos una imagen.');
    resetBoton();
    return;
  }

  const imagenUrls = [];

  for (const imagenFile of imagenFiles) {
    const timestamp = Date.now();
    const filePath = `imagenes/${timestamp}_${Math.random().toString(36).slice(2)}_${imagenFile.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('productos')
      .upload(filePath, imagenFile);

    if (uploadError) {
      alert('Error subiendo imagen: ' + uploadError.message);
      resetBoton();
      return;
    }

    const imagenUrl = `${SUPABASE_URL}/storage/v1/object/public/productos/${uploadData.path}`;
    imagenUrls.push(imagenUrl);
  }

  const imagenUrlsString = imagenUrls.join(',');

  const { error: insertError } = await supabase
    .from('Productos')
    .insert([{ titulo, descripcion, precio, estado, vendedor, whatsapp, imagen_url: imagenUrlsString, categoria }]);

  if (insertError) {
    alert('Error guardando producto: ' + insertError.message);
  } else {
    alert('Producto subido con éxito');
    form.reset();
    archivosSeleccionados = [];
    imagePreview.innerHTML = '';
  }

  resetBoton();
});

function resetBoton() {
  submitBtn.disabled = false;
  submitBtn.textContent = 'Subir producto';
  spinner.style.display = 'none';
}

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
