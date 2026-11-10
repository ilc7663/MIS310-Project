const revealItems = document.querySelectorAll("[data-reveal]");
const checklistToggle = document.querySelector("#checklist-toggle");
const footprintChecklist = document.querySelector("#footprint-checklist");

if (checklistToggle && footprintChecklist) {
  checklistToggle.addEventListener("click", () => {
    footprintChecklist.hidden = !footprintChecklist.hidden;
    const isExpanded = !footprintChecklist.hidden;
    checklistToggle.textContent = isExpanded ? "Hide checklist" : "Show checklist";
    checklistToggle.setAttribute("aria-expanded", String(isExpanded));
    console.log("Five-minute checklist expanded:", isExpanded);
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
