
const whatsappUrl = "https://wa.me/916206604163?text=Hi%2C%20I%20want%20ID.";

document.querySelectorAll(".wa-btn").forEach((button) => {
  button.href = whatsappUrl;
  button.rel = "noopener";
  button.target = "_blank";
});
