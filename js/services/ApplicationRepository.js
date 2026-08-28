import { Application } from "../models/Application.js";

export class ApplicationRepository {
  constructor() {
    this.storageKey = "bewerbungsmanager_applications";

    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, "[]");
    }
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey))
      .map(item => new Application(item));
  }

  getById(id) {
    return this.getAll().find(item => item.id === id);
  }

  save(application) {
    const applications = this.getAll();
    const index = applications.findIndex(item => item.id === application.id);

    application.updatedAt = new Date().toISOString();

    if (index === -1) {
      applications.push(application);
    } else {
      applications[index] = application;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }

  delete(id) {
    const applications = this.getAll()
      .filter(item => item.id !== id);

    localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }
}