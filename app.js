let projects = JSON.parse(localStorage.getItem("projects") || "[]");
let editingIndex = null;

const list = document.getElementById("projectsList");
const modal = document.getElementById("projectModal");

function saveProjects() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function renderProjects() {
  list.innerHTML = "";

  projects.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
      <strong>${p.name}</strong>
      <div>${p.location || ""}</div>

      <div class="project-actions">
        <button class="small-btn share">Share</button>
        <button class="small-btn delete">Delete</button>
      </div>

      <div class="edit-wrap hidden">
        <button class="small-btn edit">✏️ Edit Details</button>
      </div>
    `;

    // CARD TAP → show Edit button
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      card.querySelector(".edit-wrap").classList.toggle("hidden");
    });

    // SHARE
    card.querySelector(".share").onclick = (e) => {
      e.stopPropagation();
      const msg = `🏢 ${p.name}\n📍 ${p.location}\n📝 ${p.config}`;
      window.open("https://wa.me/?text=" + encodeURIComponent(msg));
    };

    // DELETE
    card.querySelector(".delete").onclick = (e) => {
      e.stopPropagation();
      if (confirm("Delete project?")) {
        projects.splice(index, 1);
        saveProjects();
        renderProjects();
      }
    };

    // EDIT
    card.querySelector(".edit").onclick = (e) => {
      e.stopPropagation();
      openModal(index);
    };

    list.appendChild(card);
  });
}

function openModal(index = null) {
  editingIndex = index;
  modal.classList.remove("hidden");

  if (index !== null) {
    const p = projects[index];
    projectName.value = p.name;
    projectLocation.value = p.location;
    projectConfig.value = p.config;
  } else {
    projectName.value = "";
    projectLocation.value = "";
    projectConfig.value = "";
  }
}

document.getElementById("addProjectBtn").onclick = () => openModal();

document.getElementById("cancelProject").onclick = () =>
  modal.classList.add("hidden");

document.getElementById("saveProject").onclick = () => {
  const obj = {
    name: projectName.value,
    location: projectLocation.value,
    config: projectConfig.value
  };

  if (editingIndex !== null) {
    projects[editingIndex] = obj;
  } else {
    projects.unshift(obj);
  }

  saveProjects();
  renderProjects();
  modal.classList.add("hidden");
};

renderProjects();
