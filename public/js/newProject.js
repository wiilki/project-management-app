async function newFormHandler(event) {
  event.preventDefault();

  const title = document.querySelector('input[name="project-title"]').value.trim();
  const description = document.querySelector('input[name="project-description"]').value.trim();
  const select = document.querySelector('select[name="project-progress"]');
  const deadline = document.querySelector('input[type="date"]').value.trim();

  const progress = select.options[select.selectedIndex].value;
  
  const response = await fetch(`/api/projects`, {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      progress,
      deadline
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    document.location.replace("/dashboard");
  } else {
    alert(response.statusText);
  }
}

document
  .querySelector(".new-project-form")
  .addEventListener("submit", newFormHandler);
