async function newFormHandler(event) {
  event.preventDefault();

  const title = document.querySelector('input[name="project-title"]').value;
  const description = document.querySelector('input[name="project-description"]').value;
  const progress = document.querySelector('input[name="progress"]').value;
  const date = document.querySelector('input[name="project-deadline"]').value;

  const deadline = (date.valueAsNumber);

  
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
