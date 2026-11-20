
const whatsappUrl = "https://wa.me/916206604163?text=Hi%2C%20I%20want%20ID.";

document.querySelectorAll(".wa-btn").forEach((button) => {
  button.href = whatsappUrl;
  button.rel = "noopener";
  button.target = "_blank";
  button.addEventListener("click", (event) => {
    event.preventDefault();

    let opened = false;
    const openWhatsApp = () => {
      if (!opened) {
        opened = true;
        window.open(whatsappUrl, "_blank", "noopener");
      }
    };

    if (typeof gtag === "function") {
      const fallback = window.setTimeout(openWhatsApp, 1000);

      gtag("event", "conversion", {
        send_to: "AW-18585902480/vB9ACLmDm7wdEJC7uZ5F",
        value: 1.0,
        currency: "INR",
        event_callback: () => {
          window.clearTimeout(fallback);
          openWhatsApp();
        }
      });
    } else {
      openWhatsApp();
    }
  });
});
