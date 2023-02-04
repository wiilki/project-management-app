async function editFormHandler(event) {
    event.preventDefault();
  
    const title = document.querySelector('input[name="project-title"]').value;
    const description = document.querySelector('input[name="project-description"]').value;
    const progress = document.querySelector('input[name="project-progress"]').value;
    const deadline = document.querySelector('input[name="project-deadline"]').value;
    
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
        document.location.replace('/dashboard/');
      } else {
        alert(response.statusText);
      }
  }
  
  document
  .querySelector('.edit-project-form')
  .addEventListener('submit', editFormHandler);