export class OverviewView {
  constructor(repository) {
    this.repository = repository;
  }

  render(root) {
    root.innerHTML = `
      <div class="toolbar">
        <input id="search" placeholder="Firma oder Ort suchen">
        <select id="sort">
          <option value="name">Firma A–Z</option>
          <option value="nameDesc">Firma Z–A</option>
          <option value="new">Neueste zuerst</option>
          <option value="old">Älteste zuerst</option>
        </select>
        <button class="primary" id="create">+ Neue Bewerbung</button>
      </div>
      <div id="list"></div>
    `;

    root.querySelector("#create").onclick = () => location.hash = "#/new";

    const draw = () => {
      const search = root.querySelector("#search").value.toLowerCase();
      const sort = root.querySelector("#sort").value;

      let applications = this.repository.getAll()
        .filter(item =>
          `${item.company.name} ${item.company.city}`
            .toLowerCase()
            .includes(search)
        );

      applications.sort((a, b) => {
        if (sort === "name") return a.company.name.localeCompare(b.company.name);
        if (sort === "nameDesc") return b.company.name.localeCompare(a.company.name);
        if (sort === "new") return b.createdAt.localeCompare(a.createdAt);
        return a.createdAt.localeCompare(b.createdAt);
      });

      const list = root.querySelector("#list");

      if (!applications.length) {
        list.innerHTML = "<div class='empty'>Noch keine Bewerbungen vorhanden.</div>";
        return;
      }

      list.innerHTML = applications.map(item => `
        <div class="card company-row">
          <strong>${item.company.name || "Unbenannte Firma"}</strong>
          <span>${item.company.city || "—"}</span>
          <span class="badge">${item.remote}</span>
          <span>${item.company.phones[0] || "—"}</span>
          <button data-id="${item.id}">Details</button>
        </div>
      `).join("");

      list.querySelectorAll("[data-id]").forEach(button => {
        button.onclick = () => location.hash = "#/detail/" + button.dataset.id;
      });
    };

    root.querySelector("#search").oninput = draw;
    root.querySelector("#sort").onchange = draw;

    draw();
  }
}