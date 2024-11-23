document.addEventListener('DOMContentLoaded', () => {

  const currentPath = window.location.pathname;

  console.log('Current Path:', currentPath);

  // Seleccionar todos los enlaces en el navbar
  const navLinks = document.querySelectorAll('.nav-link');

  // Recorrer los enlaces y comprobar la ruta
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active'); // Añadir clase 'active' al enlace correspondiente
    } else {
      link.classList.remove('active'); // Eliminar clase 'active' de otros enlaces
    }
  });

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const dateElements = document.querySelectorAll('[data-created-at]');
  dateElements.forEach((element) => {
    const isoDate = element.getAttribute('data-created-at');
    element.textContent = `Creado el: ${formattedDate.format(new Date(isoDate))}`;
  });

  const deleteForms = document.querySelectorAll('.delete-form');

  deleteForms.forEach((form) => {
    const deleteButton = form.querySelector('button[type="button"]');
  
    deleteButton.addEventListener('click', (e) => {
      // Mostrar SweetAlert2 para confirmar
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el proyecto de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      });
    });
  });

});