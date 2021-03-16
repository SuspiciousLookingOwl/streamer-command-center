const escapeHTML = (unsafe: string) => {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

const formatCurrency = (value: number) => {
	return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface Placeholder {
	message: string;
	amount: number;
	donator: string;
}
export const parsePlaceholder = (html: string, { message, amount, donator }: Placeholder) => {
	html = html.replace(/{message}/g, escapeHTML(message));
	html = html.replace(/{amount}/g, formatCurrency(amount));
	html = html.replace(/{name}|{donator}/g, escapeHTML(donator));
	return html;
};
