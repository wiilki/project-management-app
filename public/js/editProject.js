async function editFormHandler(event) {
    event.preventDefault();
  
    const title = document.querySelector('input[name="project-title"]').value.trim();
    const description = document.querySelector('input[name="project-description"]').value.trim();
    const select = document.querySelector('select[name="project-progress"]');
    const deadline = document.querySelector('input[type="date"]').value.trim();
  
    const progress = select.options[select.selectedIndex].value;
    
    const id = window.location.toString().split('/')[
        window.location.toString().split('/').length - 1
      ];

    const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            title,
            description,
            progress,
            deadline
        }),
        headers: {
            'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        document.location.replace('/dashboard');
      } else {
        alert("Select a date!");
        // Redirect back to the current screen
        document.location.replace(document.location.href);
      }
  }
  
  document
  .querySelector('.edit-project-form')
  .addEventListener('submit', editFormHandler);