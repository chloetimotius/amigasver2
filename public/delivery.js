




fetch('/delivery-options')
  .then(res => res.json())
  .then(options => renderOptions(options))
  .catch(err => console.error(err));

function renderOptions(options) {
  const container = document.getElementById("delivery-container");
  container.innerHTML = "";

  options.forEach(opt => {
    container.innerHTML += `
      <div class="delivery-card" onclick="highlightCard(this)">
        <h2>${opt.name}</h2>
        <p>${opt.description}</p>
        <p><strong>Fee:</strong> $${opt.fee.toFixed(2)}</p>
        <p><strong>Estimated:</strong> ${opt.estimated}</p>

        <button class="select-btn" onclick="chooseDelivery(event, ${opt.id}, ${opt.fee})">
          Choose This Option
        </button>
      </div>
    `;
  });
}

// Prevent card click when pressing button
function chooseDelivery(e, id, fee) {
  e.stopPropagation();

  const card = e.target.closest(".delivery-card");

  const ps = card.querySelectorAll("p");

  const estimatedRaw = ps[2].textContent.replace("Estimated:", "").trim();

  const selected = {
    id: id,
    fee: fee,
    name: card.querySelector("h2").textContent.trim(),
    estimated: estimatedRaw
  };

  localStorage.setItem("selectedDelivery", JSON.stringify(selected));
  localStorage.setItem("deliveryFee", fee);

  window.location.href = "cart.html";
}



// Highlight selected card
function highlightCard(card) {
  document.querySelectorAll(".delivery-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
}
