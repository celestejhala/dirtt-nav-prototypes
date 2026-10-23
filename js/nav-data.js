/*
 * Single source of truth for nav + footer content.
 * All three patterns render from this, so copy and ordering stay consistent.
 *
 * Nav item fields:
 *   label      top-level label
 *   href       top-level link (omit + set labelOnly for items that only open a menu)
 *   all        "View / All" link shown first in click panels + mobile drill-down
 *   groups     columns of links; a link is a string or { label, children: [...] }
 *   feature    card in click panels. `inList` controls how it appears in list-style
 *              menus (hover, accordion, drill-down): "own" = its own group,
 *              "append" = added to the end of the last group, omitted = card only.
 *              `optional: true` notes it as optional in the wires (not shown in the UI).
 *              `style` sets the card in B and C: "stacked" (default) = image, title,
 *              description; "tile" = grey box with the title inside.
 *   extraFeature  a second card shown after the first, in C (full width) only.
 */
window.DIRTT_DATA = {
  nav: [
    {
      id: "services",
      label: "Services",
      href: "#services",
      all: "View services",
      groups: [
        {
          eyebrow: "Who we work with",
          links: ["Architects & designers", "General contractors", "Owners"],
        },
      ],
      feature: {
        title: "Why choose DIRTT",
        desc: "Lorem ipsum dolor sit amet consectetur. Ultricies dictum dui cursus interdum.",
        inList: "own",
      },
    },
    {
      id: "products",
      label: "Products",
      href: "#products",
      all: "All products",
      groups: [
        { links: [{ label: "Walls", children: ["Solid walls", "Glass walls", "Specialty walls"] }] },
        { links: ["Doors", "Access floors", "Casework", "Upgrades"] },
      ],
      feature: {
        title: "COVE™",
        desc: "Lorem ipsum dolor sit amet consectetur. Ultricies dictum dui cursus interdum.",
        inList: "append",
      },
    },
    {
      id: "case-studies",
      label: "Case studies",
      href: "#case-studies",
      all: "All case studies",
      groups: [{ links: ["Workplaces", "Healthcare", "Education", "Public sector"] }],
      feature: {
        title: "Experience Center",
        style: "tile",
        optional: true,
      },
      extraFeature: { title: "Feature", style: "tile", optional: true },
    },
    {
      id: "resources",
      label: "Resources",
      labelOnly: true,
      groups: [
        {
          eyebrow: "Files & specs",
          links: ["CAD files", "Acoustic performance (TBD)", "Finishes & materials"],
        },
        { eyebrow: "Inspiration (TBD)", links: ["Insights (TBD)", "Image gallery (TBD)"] },
      ],
      feature: {
        title: "Feature",
        style: "tile",
        optional: true,
      },
    },
    {
      id: "about",
      label: "About us",
      href: "#about",
      all: "View about us",
      groups: [{ links: ["Sustainability", "News", "Investors", "Contact us"] }],
      feature: {
        title: "Award",
        style: "tile",
        optional: true,
      },
      extraFeature: { title: "Award", style: "tile", optional: true },
    },
  ],

  ctas: { primary: "Contact us", secondary: "Book a tour" },

  footer: {
    headline: "Lorem ipsum dolor sit amet",
    columns: [
      { id: "explore", title: "Explore", links: ["Case studies", "Why choose DIRTT", "Sustainability", "Insights (TBD)"] },
      { id: "company", title: "Company info", links: ["About us", "Investors", "Press releases", "Careers", "FAQ"] },
      { id: "social", title: "Social", links: ["Instagram", "YouTube", "LinkedIn"] },
    ],
    newsletter: "Stay up to date with our newsletter",
    legal: ["Accessibility", "Privacy policy", "Intellectual property", "Terms & conditions"],
    copyright: "© DIRTT 2026",
  },
};
