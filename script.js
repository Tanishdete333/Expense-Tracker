let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-amount');
const expenseEl = document.getElementById('expense-amount');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');

// Charts
let monthlyChart, yearlyChart;

form.addEventListener('submit', addTransaction);

function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts.filter(i => i > 0).reduce((acc, i) => acc + i, 0).toFixed(2);
    const expense = (
        amounts.filter(i => i < 0).reduce((acc, i) => acc + i, 0) * -1
    ).toFixed(2);

    balanceEl.innerText = `₹${total}`;
    incomeEl.innerText = `₹${income}`;
    expenseEl.innerText = `₹${expense}`;
}

function addTransaction(e) {
    e.preventDefault();

    const text = document.getElementById('text').value.trim();
    const amount = +document.getElementById('amount').value;

    if (!text || !amount) return alert('Please enter text and amount');

    const transaction = {
        id: generateID(),
        text,
        amount,
        timestamp: new Date().toISOString()
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransactionDOM(transaction) {
    const item = document.createElement('li');
    item.classList.add('list-group-item', transaction.amount < 0 ? 'minus' : 'plus');
    item.innerHTML = `
        ${transaction.text} <span>₹${Math.abs(transaction.amount)}</span>
        <button class="btn btn-danger btn-sm" onclick="removeTransaction(${transaction.id})">×</button>
    `;
    transactionList.appendChild(item);
}

function init() {
    transactionList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    renderCharts();
}

function renderCharts() {
    const ctx1 = document.getElementById('monthlyChart').getContext('2d');
    const ctx2 = document.getElementById('yearlyChart').getContext('2d');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = transactions.filter(t => {
        const d = new Date(t.timestamp);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth && t.amount > 0;
    }).reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpense = transactions.filter(t => {
        const d = new Date(t.timestamp);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth && t.amount < 0;
    }).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const monthlyBalances = new Array(12).fill(0);
    transactions.forEach(t => {
        const d = new Date(t.timestamp);
        if (d.getFullYear() === currentYear) {
            monthlyBalances[d.getMonth()] += t.amount;
        }
    });

    if (monthlyChart) monthlyChart.destroy();
    if (yearlyChart) yearlyChart.destroy();

    monthlyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [monthlyIncome, monthlyExpense],
                backgroundColor: ['#28a74588', '#dc354588'],
                borderColor: ['#28a745', '#dc3545'],
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });

    yearlyChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Net Balance',
                data: monthlyBalances,
                borderColor: '#0d6efd',
                fill: false,
                tension: 0.3
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    const icon = document.querySelector('#theme-toggle i');
    icon.classList.toggle('bi-moon-fill');
    icon.classList.toggle('bi-brightness-high-fill');
});

init();

