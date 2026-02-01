# Website Redesign Plan: Design & Structure

## Overview

Plan for henrikkorsgaard.dk - a professional profile site with blog, demos, and research archive. Hand-coded HTML/CSS, no build system (deliberate choice).

---

## Part 1: Site Structure

### Proposed Navigation

```
index.html      → Home (minimal intro, current role, links to resume/services, last 5 notes/projects)
about.html      → About (expanded profile, services, contact info)
notes.html      → Notes index (short notes + essays, tagged, sorted by date)
projects.html   → Projects grid (visual thumbnails)
research.html   → Research (publications, dissertation) [exists]
```

### File Organization

```
/
├── index.html
├── about.html
├── notes.html
├── projects.html
├── research.html
├── style/
│   └── main.css
├── media/
│   ├── images/
│   ├── pdfs/
│   └── data/          (for demo datasets if needed)
├── notes/             (individual note pages, if splitting out)
│   └── [note-slug].html
├── projects/          (individual project pages)
│   └── [project-slug].html
└── js/                (for interactive demos)
```

### Content Organization Questions

**Notes/Blog:**

- Current: All notes in single `notes.html` file
- Alternative: Individual files per note with index listing

**Projects:**

- New section for demos and past work
- Each project gets its own page with description, images/video, links

---

## Part 2: Design Direction

### Current Design Elements (to keep/refine)

- Dark theme (page: #262626, menu: #212121)
- Fixed left sidebar with logo
- Monospace font (Inconsolata) for body
- Computer Modern Sans for headings (academic feel)
- Orange headings (#e57e43)
- Muted blue-gray links (#889eaa)
- 90's retro aesthetic with modern dark mode

### Design Decisions Needed

**1. Homepage content:** ✓ DECIDED

- Minimal intro paragraph
- Current role/affiliation section
- Links to resume and services
- List of last 5 notes/projects sorted by date

**2. Notes layout:** ✓ DECIDED

- Two types: short notes and longer essays
- Individual pages per note/essay
- Index page with listing
- Tagged and sorted by date

**3. Projects presentation:** ✓ DECIDED

- Visual grid with thumbnails
- Individual project pages

**4. Responsive design:** ✓ DECIDED

- Desktop first
- Mobile responsiveness later (but planned for)

**5. Footer/contact:** ✓ DECIDED

- Contact info and social links in site footer
- Separate about page with expanded profile/services info

---

## Part 3: Later Steps (noted for future)

1. **Content migration** - Decide what to bring over from main branch (Quarto site)
   - 6+ blog posts with data visualizations
   - 7 project showcases with images/videos
   - Resume page
2. **Writing format decision** - Stay pure HTML or add minimal Markdown tooling

---

## Open Questions

Before finalizing the design/structure plan:

1. ~~**Homepage** - What should visitors see first? Just a brief intro, or also featured content?~~ ✓ DECIDED

2. ~~**Notes organization** - Single page with all notes (current), or split into individual pages with an index?~~ ✓ DECIDED

3. ~~**Projects section** - What presentation style appeals to you? Visual grid with thumbnails, or text-based list?~~ ✓ DECIDED

4. ~~**Mobile** - Do you care about mobile responsiveness, or is this primarily a desktop experience?~~ ✓ DECIDED

5. ~~**Contact/social** - Should there be contact info or links to GitHub/LinkedIn somewhere?~~ ✓ DECIDED
