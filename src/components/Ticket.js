export default class Ticket {
    constructor(data) {
        this.data = data;
    }

    getDate(created) {
        const now = new Date(created);

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    renderTicket() {
        const { id, name, description, status, created } = this.data
        return `
        <div class="ticket" id=${id}>
            <div class="ticket-content">
                <button class="checkbox"><i class="fa-solid fa-check check ${status}"></i></button>
                <p class="ticket-value">${name}</p>
                <div class="ticket-date">${this.getDate(created)}</div>
                <button class="change-ticket"><i class="fa-solid fa-pen"></i></button>
                <button class="remove-ticket"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="detailedDescription">
                <p>${description}</p>
            </div>
        </div>
        `;
    }
}
