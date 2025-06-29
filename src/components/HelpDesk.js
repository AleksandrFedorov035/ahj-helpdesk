export default class HelpDesk {
  constructor(container) {
    this.container = container;
    this.renderUI();
  }

  renderUI() {
    const html = `
            <div class="content">
                <button type="button" class="add-ticket">Добавить тикет</button>
                <div class="tickets"></div>
            </div>
            <div class="modal">
                <div class="modal-content">
                    <h2></h2>
                    <form class="addTicketForm">
                        <label for="shortDescription">Краткое описание</label>
                        <input type="text" id="shortDescription" name="shortDescription" required />
                        <label for="detailedDescription">Подробное описание</label>
                        <textarea id="detailedDescription" name="detailedDescription" rows="4" cols="50"></textarea>
                        <button type="button" class="addButton">Ок</button>
                        <button type="button" class="cancelButton">Отмена</button>
                    </form>
                </div>
            </div>
            <div class="delete-modal">
                <div class="delete-modal-content">
                    <h2>Удалить тикет</h2>
                    <p>Вы уверены, что хотите удалить тикет? Это действие необратимо.</p>
                    <button class="ok-button">Ок</button>
                    <button class="cancel-button">Отмена</button>
                </div>
            </div>
        `;
    this.container.innerHTML = html;
    this.container
      .querySelector(".add-ticket")
      .addEventListener("click", (e) => this.showPopUp(e));
    this.container
      .querySelector(".cancelButton")
      .addEventListener("click", () => this.closePopUp());
    this.container
      .querySelector(".addButton")
      .addEventListener("click", (e) => {
        if (
          document.querySelector(".modal h2").textContent === "Добавить тикет"
        )
          this.addTicket(e);
        else this.updateTicket(e);
      });
    this.container
      .querySelector(".cancel-button")
      .addEventListener("click", () => this.closeDeleteModal());
    this.container
      .querySelector(".ok-button")
      .addEventListener("click", () => this.deleteTicket());
  }

  showPopUp(e) {
    this.container.querySelector(".modal").style.display = "block";
    const h2 = document.querySelector(".modal h2");
    if (e.target.classList.contains("add-ticket")) {
      h2.textContent = "Добавить тикет";
    } else {
      h2.textContent = "Изменить тикет";
    }
  }

  closePopUp() {
    this.container.querySelector(".modal").style.display = "none";
    document.querySelector("#shortDescription").value = "";
    document.querySelector("#detailedDescription").value = "";
    if (document.querySelector(".error"))
      document.querySelector(".error").remove();
  }

  renderTicket(ticketValue, date, detailedDescription) {
    return `
        <div class="ticket">
            <div class="ticket-content">
                <button class="checkbox"><i class="fa-solid fa-check check"></i></button>
                <p class="ticket-value">${ticketValue}</p>
                <div class="ticket-date">${date}</div>
                <button class="change-ticket"><i class="fa-solid fa-pen"></i></button>
                <button class="remove-ticket"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="detailedDescription">
                <p>${detailedDescription}</p>
            </div>
        </div>
        `;
  }

  addTicket(e) {
    e.preventDefault();

    let shortDescriptionValue = document
      .querySelector("#shortDescription")
      .value.trim();
    let detailedDescription = document
      .querySelector("#detailedDescription")
      .value.trim();

    if (shortDescriptionValue === "" || detailedDescription === "") {
      if (document.querySelector(".error")) return;
      const error =
        '<p style="color: red" class="error">Заполните все поля!</p>';
      document
        .querySelector(".addTicketForm")
        .insertAdjacentHTML("beforeend", error);
      return;
    }

    const date = this.getDate();
    const ticket = this.renderTicket(
      shortDescriptionValue,
      date,
      detailedDescription,
    );
    this.container
      .querySelector(".tickets")
      .insertAdjacentHTML("beforeend", ticket);

    const lastAddedTicket = document.querySelector(".tickets").lastElementChild;
    lastAddedTicket.addEventListener("click", (e) => this.showDescription(e));
    lastAddedTicket
      .querySelector(".change-ticket")
      .addEventListener("click", (e) => this.showEditPopUp(e, lastAddedTicket));
    lastAddedTicket.querySelector(".checkbox").addEventListener("click", () => {
      lastAddedTicket.querySelector(".check").classList.toggle("active");
    });
    lastAddedTicket
      .querySelector(".remove-ticket")
      .addEventListener("click", () => this.showDeleteModal(lastAddedTicket));

    this.closePopUp();
  }

  getDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  showDescription(e) {
    if (
      e.target.classList.contains("change-ticket") ||
      e.target.classList.contains("remove-ticket") ||
      e.target.classList.contains("checkbox") ||
      e.target.classList.contains("fa-trash") ||
      e.target.classList.contains("fa-pen") ||
      e.target.classList.contains("check")
    )
      return;

    e.target
      .closest(".ticket")
      .querySelector(".detailedDescription")
      .classList.toggle("active");
  }

  showEditPopUp(e, ticket) {
    this.showPopUp(e);
    document.querySelector("#shortDescription").value =
      ticket.querySelector(".ticket-value").textContent;
    document.querySelector("#detailedDescription").value = ticket.querySelector(
      ".detailedDescription p",
    ).textContent;

    this.currentEditingTicket = ticket;
  }

  updateTicket(e) {
    e.preventDefault();

    let shortDescriptionValue = document
      .querySelector("#shortDescription")
      .value.trim();
    let detailedDescription = document
      .querySelector("#detailedDescription")
      .value.trim();

    if (shortDescriptionValue === "" || detailedDescription === "") {
      if (document.querySelector(".error")) return;
      const error =
        '<p style="color: red" class="error">Заполните все поля!</p>';
      document
        .querySelector(".addTicketForm")
        .insertAdjacentHTML("beforeend", error);
      return;
    }

    const ticket = this.currentEditingTicket;
    ticket.querySelector(".ticket-value").textContent = shortDescriptionValue;
    ticket.querySelector(".detailedDescription p").textContent =
      detailedDescription;

    this.closePopUp();
  }

  showDeleteModal(ticket) {
    this.container.querySelector(".delete-modal").style.display = "block";
    this.currentDeletingTicket = ticket;
  }

  closeDeleteModal() {
    this.container.querySelector(".delete-modal").style.display = "none";
  }

  deleteTicket() {
    this.currentDeletingTicket.remove();
    this.closeDeleteModal();
  }
}
