# Website Redesign Plan: Design & Structure

## Overview
Plan for henrikkorsgaard.dk - a professional profile site with blog, demos, and research archive. Hand-coded HTML/CSS, no build system (deliberate choice).

---

## Part 1: Site Structure

### Proposed Navigation
```
index.html      → About/Home (intro, current role, brief bio)
notes.html      → Blog/Notes (personal writing, musings)
projects.html   → Projects/Things (demos, interactive experiments, past work)
research.html   → Research (publications, dissertation) [exists]
```

### File Organization
```
/
├── index.html
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

**1. Homepage content:**
- Brief intro paragraph?
- Photo?
- Current role/affiliation?
- Featured/recent content?

**2. Notes layout:**
- Keep all notes on one page (current)?
- Or index page with links to individual note pages?
- Date display format?
- Preview text for index?

**3. Projects presentation:**
- Grid of thumbnails/previews?
- List format like notes?
- Tags/categories?

**4. Responsive design:**
- Current: Fixed sidebar (not mobile-friendly)
- Need mobile breakpoint for sidebar collapse?

**5. Footer/contact:**
- Add contact info?
- Social links (GitHub, etc.)?
- In sidebar or footer?

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

1. **Homepage** - What should visitors see first? Just a brief intro, or also featured content?

2. **Notes organization** - Single page with all notes (current), or split into individual pages with an index?

3. **Projects section** - What presentation style appeals to you? Visual grid with thumbnails, or text-based list?

4. **Mobile** - Do you care about mobile responsiveness, or is this primarily a desktop experience?

5. **Contact/social** - Should there be contact info or links to GitHub/LinkedIn somewhere?
