import Ticket from "./Ticket"

export default class HelpDesk {
  constructor(container) {
    this.container = container;
    this.renderUI();
    this.tickets = []
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
                        <input type="text" id="shortDescription" name="shortDescription" />
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
    this.container.querySelector(".add-ticket").addEventListener('click', (e) => this.showPopUp(e))
    this.container.querySelector(".cancelButton").addEventListener('click', () => this.closePopUp())
    this.container
      .querySelector(".addButton")
      .addEventListener("click", (e) => {
        document.querySelector(".modal h2").textContent === "Добавить тикет"
        ? this.addTicket(e)
        : this.editTicket(e);
      });
    this.container
      .querySelector(".cancel-button")
      .addEventListener("click", () => this.container.querySelector('.delete-modal').style.display = "none")

    this.container
      .querySelector(".ok-button")
      .addEventListener("click", () => this.deleteTicket());



    this.container.querySelector('.tickets').addEventListener('click', (event) => {
      const target = event.target;

      if (target.matches('.checkbox') || target.matches('.check')) {
        this.handleCheckboxChange(target.closest('.ticket'));
      } else if (target.matches('.remove-ticket') || target.matches('.fa-trash')) {
        this.container.querySelector('.delete-modal').style.display = "block";
      } else if (target.matches('.change-ticket') || target.matches('.fa-pen')) {
        this.showPopUp(event);
      } else if (target.closest('.ticket')) {
        this.showDescription(event);
      }

      this.targetElement = target.closest('.ticket');
    });

    this.renderTickets()
  }

  showDescription(e) {
    e.target
      .closest('.ticket')
      .querySelector(".detailedDescription")
      .classList.toggle("active");
  }

  showPopUp(e) {
    this.container.querySelector(".modal").style.display = "block";
    const h2 = document.querySelector(".modal h2");
    if (e.target.classList.contains("add-ticket")) {
      h2.textContent = "Добавить тикет";
    } else {
      h2.textContent = "Изменить тикет";

      document.querySelector("#shortDescription").value =
        e.target.closest(".ticket").querySelector(".ticket-value").textContent;
      document.querySelector("#detailedDescription").value = e.target.closest(".ticket").querySelector(
        ".detailedDescription p",
      ).textContent;
    }
  }

  closePopUp() {
    this.container.querySelector(".modal").style.display = "none";
    document.querySelector("#shortDescription").value = "";
    document.querySelector("#detailedDescription").value = "";
    if (document.querySelector(".error"))
      document.querySelector(".error").remove();
  }

  async getAllTickets() {
    const response = await fetch('http://localhost:7070/api?method=allTickets')
    if (!response.ok) throw new Error("Failed to get tickets");
    return response.json()
  }

  async createTicketRequest({ id, name, status, description }) {
    const response = await fetch('http://localhost:7070/api?method=createTicket', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, status, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create ticket");
    }
    return response.json();
  }

  async deleteRequest(id) {
    const response = await fetch(`http://localhost:7070/api?method=deleteById&id=${id}`, { method: "DELETE" })
    if (!response.ok) {
      throw new Error(`Failed to delete ticket with id ${id}`);
    }
  }

  async updateTicketById(id, updates) {
    const response = await fetch(`http://localhost:7070/api?method=updateById&id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ticket with id ${id}`);
    }
    return response.json();
  }

  renderTickets() {
    this.getAllTickets().then(res => {
      this.tickets = [...res]
      this.tickets.forEach(el => {
        const _ticket = new Ticket(el)
        this.container.querySelector('.tickets').insertAdjacentHTML("beforeend", _ticket.renderTicket())
      })

    })
  }

  async addTicket(e) {
    e.preventDefault();
    const shortDescriptionValue = document.querySelector('#shortDescription').value.trim();
    const detailedDescription = document.querySelector('#detailedDescription').value.trim();

    if (!shortDescriptionValue) {
      if (document.querySelector(".error")) return;
      const error = '<p style="color: red" class="error">Заполните все поля!</p>';
      document.querySelector(".addTicketForm").insertAdjacentHTML("beforeend", error);
      return;
    }

    const newTicket = {
      id: null,
      name: shortDescriptionValue,
      status: false,
      description: detailedDescription
    };

    try {
      const res = await this.createTicketRequest(newTicket);
      this.tickets.push(res);
      const _ticket = new Ticket(res);
      this.container.querySelector('.tickets').insertAdjacentHTML("beforeend", _ticket.renderTicket());
      this.closePopUp();
    } catch (err) {
      throw new Error(`Ошибка создания тикета: ${err.message}`);
    }
  }

  async deleteTicket() {
    const ticketEl = this.targetElement
    try {
      await this.deleteRequest(ticketEl.id);
      ticketEl.remove();
      this.tickets = this.tickets.filter(ticket => ticket.id !== ticketEl.id);
      this.container.querySelector('.delete-modal').style.display = "none"
    } catch (err) {
      throw new Error(`Ошибка удаления тикета: ${err.message}`);
    }
  }

  async editTicket() {
    const ticketEl = this.targetElement;

    const shortDescriptionValue = document.querySelector("#shortDescription").value.trim();
    const detailedDescription = document.querySelector("#detailedDescription").value.trim();

    if (!shortDescriptionValue) {
      if (document.querySelector(".error")) return;
      const error = '<p style="color: red" class="error">Заполните все поля!</p>';
      document.querySelector(".addTicketForm").insertAdjacentHTML("beforeend", error);
      return;
    }

    const newTicket = {
      name: shortDescriptionValue,
      description: detailedDescription
    };

    try {
      await this.updateTicketById(ticketEl.id, newTicket);

      const indexOfEditedTicket = this.tickets.findIndex(ticket => ticket.id === ticketEl.id);

      this.tickets[indexOfEditedTicket].name = shortDescriptionValue;
      this.tickets[indexOfEditedTicket].description = detailedDescription;

      const updatedTicketComponent = new Ticket(this.tickets[indexOfEditedTicket]);
      const updatedHtml = updatedTicketComponent.renderTicket();

      ticketEl.outerHTML = updatedHtml;

      this.closePopUp();
    } catch (error) {
      throw new Error(`Не получилось изменить тикет: ${error.message}`);
    }
  }

  async handleCheckboxChange(ticketEl) {
    const checkIcon = ticketEl.querySelector('.check')

    checkIcon.classList.toggle('true');
    checkIcon.classList.toggle('false');

    const status = checkIcon.classList.contains('true');

    try {
      await this.updateTicketById(ticketEl.id, { status });
    } catch (error) {
      throw new Error(`Не удалось обновить статус тикета: ${error.message}`);
    }
  }
}
