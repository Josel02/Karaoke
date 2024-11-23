document.addEventListener('DOMContentLoaded', () => {
    const deleteForms = document.querySelectorAll('.delete-form');
    const dateElements = document.querySelectorAll('[data-created-at]');
  
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

    dateElements.forEach((element) => {
      const isoDate = element.getAttribute('data-created-at');
      const formattedDate = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(new Date(isoDate));
  
      element.textContent = `Creado el: ${formattedDate}`;
    });

  });