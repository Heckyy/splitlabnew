document.addEventListener("DOMContentLoaded", function () {
  // Cek apakah redirect sudah terjadi dalam sesi ini
  if (sessionStorage.getItem("hasRedirected")) {
    return; // Jika sudah, hentikan script
  }

  // Retrieve the counts from localStorage, atau mulai dengan 0
  var tempSlug1 = localStorage.getItem("slug1_hits")
    ? parseInt(localStorage.getItem("slug1_hits"))
    : 0;
  var tempSlug2 = localStorage.getItem("slug2_hits")
    ? parseInt(localStorage.getItem("slug2_hits"))
    : 0;

  // URL slugs untuk redirect
  var slugs = ["home2", "home1"];

  // Tentukan slug dengan jumlah hit terkecil
  var minHits = Math.min(tempSlug1, tempSlug2);
  var possibleSlugs = [];

  if (tempSlug1 === minHits) {
    possibleSlugs.push("home2");
  }
  if (tempSlug2 === minHits) {
    possibleSlugs.push("home1");
  }

  // Pilih secara acak dari slugs dengan jumlah hit terkecil
  var selectedSlug =
    possibleSlugs[Math.floor(Math.random() * possibleSlugs.length)];

  // Update jumlah berdasarkan slug yang dipilih
  if (selectedSlug === "home2") {
    tempSlug1++;
    localStorage.setItem("slug1_hits", tempSlug1); // Perbarui jumlah untuk slug1
  } else if (selectedSlug === "home1") {
    tempSlug2++;
    localStorage.setItem("slug2_hits", tempSlug2); // Perbarui jumlah untuk slug2
  }

  // Tandai bahwa redirect sudah terjadi
  sessionStorage.setItem("hasRedirected", "true");

  // Redirect ke slug yang dipilih
  var currentUrl = window.location.origin; // Dapatkan domain utama saja
  window.location.href = currentUrl + "/" + selectedSlug;
});
