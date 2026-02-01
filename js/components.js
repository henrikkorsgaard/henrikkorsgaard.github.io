/**
 * Site Menu Web Component
 *
 * Usage:
 *   <site-menu current="home"></site-menu>
 *
 * The 'current' attribute should be one of: home, about, notes, projects, research
 * This highlights the current page in the navigation.
 *
 * For pages in subdirectories (e.g., /projects/foo.html), use base-path="../"
 *   <site-menu current="projects" base-path="../"></site-menu>
 */
class SiteMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const current = this.getAttribute("current") || "";
    const basePath = this.getAttribute("base-path") || "./";

    const menuItems = [
      { id: "home", label: "Home", href: "index.html" },
      { id: "about", label: "About", href: "about.html" },
      { id: "notes", label: "Notes", href: "notes.html" },
      { id: "projects", label: "Projects", href: "projects.html" },
      { id: "research", label: "Research", href: "research.html" },
    ];

    const menuItemsHTML = menuItems
      .map((item) => {
        const isCurrent = item.id === current;
        return `<li${isCurrent ? ' class="here"' : ""}><a href="${basePath}${item.href}">${item.label}</a></li>`;
      })
      .join("\n                ");

    this.innerHTML = `
        <menu>
            <a href="${basePath}index.html">
                <img src="${basePath}media/images/henrik-transparent.png" alt="Henrik Korsgaard" />
            </a>
            <ul>
                ${menuItemsHTML}
            </ul>
            <footer>
                <a href="mailto:korsgaard@protonmail.com">Email</a>
                <a href="https://github.com/henrikkorsgaard">GitHub</a>
                <a href="https://linkedin.com/in/henrik-korsgaard-77a0831b">LinkedIn</a>
            </footer>
        </menu>
        `;
  }
}

customElements.define("site-menu", SiteMenu);
