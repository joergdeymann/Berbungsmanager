export class BaseEditTab {
  constructor(root) {
    this.root = root;
  }

  get(id) {
    return this.root.querySelector("#" + id)?.value || "";
  }

  set(id, value) {
    const element = this.root.querySelector("#" + id);
    if (element) element.value = value ?? "";
  }

  list(id) {
    return this.get(id).split("\n").map(x => x.trim()).filter(Boolean);
  }

  escapeAttribute(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
