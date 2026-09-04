function showDemo(name) {
  const toast = document.getElementById("toast");
  toast.textContent = `${name} will become functional in Version 2.`;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
