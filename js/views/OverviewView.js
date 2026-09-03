function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toGermanDate(date) {
    if (!date) return "";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? date
        : parsed.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
}

const STATUS = {
    ENTWURF: "Nicht beworben",
    BEWORBEN: "Beworben",
    EINGANG: "Eingangsbestätigung",
    RUECKRUF: "Rückruf erhalten",
    ANGENOMMEN: "Angenommen",
    ABGELEHNT: "Abgelehnt"
};

const STATUS_CLASS = {
    [STATUS.ENTWURF]: "status-draft",
    [STATUS.BEWORBEN]: "status-applied",
    [STATUS.EINGANG]: "status-confirmed",
    [STATUS.RUECKRUF]: "status-callback",
    [STATUS.ANGENOMMEN]: "status-accepted",
    [STATUS.ABGELEHNT]: "status-rejected"
};

export class OverviewView {
    constructor(repository) {
        this.repository = repository;
    }

    render(root) {


        root.innerHTML = `
      <div class="toolbar overview-toolbar">
        <input id="search" placeholder="Firma, Stelle oder Ort suchen">
        <select id="statusFilter">
          <option value="">Alle Status</option>
          ${Object.values(STATUS)
                .map(status => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`)
                .join("")}
        </select>
        <select id="sort">
          <option value="name">Firma A–Z</option>
          <option value="nameDesc">Firma Z–A</option>
          <option value="new">Neueste zuerst</option>
          <option value="old">Älteste zuerst</option>
        </select>
        <button class="primary width8em" id="compact">Compact</button>
      </div>
      <div id="list"></div>
    `;

            
        root.querySelector("#compact").onclick = () => {
            let c = root.querySelector("#compact");
            c.innerText = c.innerText === "Compact"?"Informiert":"Compact";
            c.style.width = "8em";
            root.querySelector("#list").classList.toggle("compact");
        };
        const draw = () => {
            const search = root.querySelector("#search").value.toLowerCase().trim();
            const statusFilter = root.querySelector("#statusFilter").value;
            const sort = root.querySelector("#sort").value;

            let applications = this.repository.getAll()
                .filter(item => {
                    const haystack = [
                        item.company?.name,
                        item.company?.city,
                        item.job?.title
                    ].join(" ").toLowerCase();
                    const status = item.application?.status || STATUS.ENTWURF;
                    return haystack.includes(search) && (!statusFilter || status === statusFilter);
                });

            applications.sort((a, b) => {
                if (sort === "name") return (a.company?.name || "").localeCompare(b.company?.name || "");
                if (sort === "nameDesc") return (b.company?.name || "").localeCompare(a.company?.name || "");
                if (sort === "new") return (b.createdAt || "").localeCompare(a.createdAt || "");
                return (a.createdAt || "").localeCompare(b.createdAt || "");
            });

            const list = root.querySelector("#list");
            if (!applications.length) {
                list.innerHTML = "<div class='empty'>Noch keine passenden Bewerbungen vorhanden.</div>";
                return;
            }

            list.innerHTML = applications.map(item => {
                const status = item.application?.status || STATUS.ENTWURF;
                const statusClass = STATUS_CLASS[status] || "status-draft";
                const action = this.getAction(item);
                return `
                    <div class="application-card application-row">
                        <div class="flex-row left-side">
                            <span class="status-badge ${statusClass}">${escapeHtml(status)}<br>${escapeHtml(toGermanDate(item.application?.appliedAt || ""))}</span>

                            <div class="application-main">
                                <strong>${escapeHtml(item.company?.name || "Unbenannte Firma")}</strong>
                                <span class="toggler">${escapeHtml(item.job?.title || "Keine Stelle angegeben")}</span>
                                <small class="toggler">${escapeHtml(item.company?.city || "—")}</small>
                            </div>
                        </div>

                        <div class="application-actions">
                            <button data-view="${item.id}">Ansicht</button>
                            <button data-edit="${item.id}">Update</button>
                            ${action ? `<button class="primary" data-action="${item.id}">${escapeHtml(action.label)}</button>` : ""}
                            ${status === STATUS.RUECKRUF ? `
                                <button data-decision="accepted" data-id="${item.id}">Angenommen</button>
                                <button class="danger" data-decision="rejected" data-id="${item.id}">Abgelehnt</button>
                            ` : ""}
                        </div>
                    </div>
                    `;
                
            }).join("");

            list.querySelectorAll("[data-view]").forEach(button => {
                button.onclick = () => location.hash = "#/detail/" + encodeURIComponent(button.dataset.view);
            });
            list.querySelectorAll("[data-edit]").forEach(button => {
                button.onclick = () => location.hash = "#/edit/" + encodeURIComponent(button.dataset.edit);
            });
            list.querySelectorAll("[data-action]").forEach(button => {
                button.onclick = () => this.executeAction(button.dataset.action, draw);
            });
            list.querySelectorAll("[data-decision]").forEach(button => {
                button.onclick = () => {
                    const app = this.repository.getById(button.dataset.id);
                    if (!app) return;
                    app.application.status = button.dataset.decision === "accepted" ? STATUS.ANGENOMMEN : STATUS.ABGELEHNT;
                    if (app.application.status === STATUS.ABGELEHNT) {
                        app.application.rejectionAt = new Date().toISOString().slice(0, 10);
                    }
                    this.repository.save(app);
                    draw();
                };
            });
        };

        root.querySelector("#search").oninput = draw;
        root.querySelector("#statusFilter").onchange = draw;
        root.querySelector("#sort").onchange = draw;
        draw();
    }

    getAction(application) {
        const status = application.application?.status || STATUS.ENTWURF;
        if (status === STATUS.ENTWURF) return { label: "Bewerben" };
        if (status === STATUS.BEWORBEN) return { label: "Eingangsbestätigung" };
        if (status === STATUS.EINGANG) return { label: "Rückruf erhalten" };
        if (status === STATUS.RUECKRUF) return { label: "Anrufen" };
        return null;
    }

    executeAction(id, redraw) {
        const application = this.repository.getById(id);
        if (!application) return;

        const status = application.application?.status || STATUS.ENTWURF;
        if (status === STATUS.RUECKRUF) {
            const note = prompt("Telefonat / Rückruf dokumentieren:");
            if (note?.trim()) {
                application.communication = application.communication || [];
                application.communication.push({
                    id: crypto.randomUUID(),
                    type: "Telefonat",
                    text: note.trim(),
                    date: new Date().toISOString()
                });
                this.repository.save(application);
            }
            redraw();
            return;
        }

        const next = {
            [STATUS.ENTWURF]: STATUS.BEWORBEN,
            [STATUS.BEWORBEN]: STATUS.EINGANG,
            [STATUS.EINGANG]: STATUS.RUECKRUF
        }[status];

        if (next) {
            application.application.status = next;
            if (next === STATUS.BEWORBEN && !application.application.appliedAt) {
                application.application.appliedAt = new Date().toISOString().slice(0, 10);
            }
            this.repository.save(application);
            redraw();
        }
    }
}
