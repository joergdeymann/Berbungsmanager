export class Router {
  constructor(root, routes) {
    this.root = root;
    this.routes = routes;
  }

  start() {
    window.addEventListener("hashchange", () => this.render());
    this.render();
  }

  render() {
    const hash = location.hash.slice(1) || "/";

    for (const [pattern, factory] of Object.entries(this.routes)) {
      const names = [];
      const expression = "^" + pattern.replace(/:([^/]+)/g, (_, name) => {
        names.push(name);
        return "([^/]+)";
      }) + "$";

      const match = hash.match(new RegExp(expression));

      if (match) {
        const params = {};
        names.forEach((name, index) => params[name] = decodeURIComponent(match[index + 1]));
        const view = factory(params);
        this.root.innerHTML = "";
        view.render(this.root);
        return;
      }
    }

    this.root.innerHTML = "<div class='empty'>Seite nicht gefunden.</div>";
  }
}