import { Router } from "./core/Router.js";
import { ApplicationRepository } from "./services/ApplicationRepository.js";
import { OverviewView } from "./views/OverviewView.js";
import { EditorView } from "./views/ModernEditorView.js";
import { DetailView } from "./views/DetailView.js";

const repository = new ApplicationRepository();
const root = document.querySelector("#app");

const router = new Router(root, {
  "/": () => new OverviewView(repository),
  "/new": () => new EditorView(repository),
  "/edit/:id": (params) => new EditorView(repository, params.id),
  "/detail/:id": (params) => new DetailView(repository, params.id)
});

// document.querySelectorAll("[data-route]").forEach(button => {
//   button.addEventListener("click", () => location.hash = button.dataset.route);
// });
document.addEventListener("click", event => {
    const button = event.target.closest("[data-route]");
    if (!button) return;
    location.hash = button.dataset.route;
});


router.start();