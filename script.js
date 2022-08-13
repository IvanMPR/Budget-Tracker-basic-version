'use strict';

const inputTypeInc = document.getElementById('inc');
const inputTypeExp = document.getElementById('exp');
const description = document.querySelector('.inputs__description--input');
const amount = document.querySelector('.inputs__value--value');
const button = document.querySelector('.inputs__submit--btn');
const buttonEdit = document.querySelector('.edit-entry');
const transactionsDiv = document.querySelector('.transactions');
const modalParent = document.querySelector('.modal');
const incomesUl = document.querySelector('.transactions__incomes--ul');
const expensesUl = document.querySelector('.transactions__expenses--ul');
const totalSum = document.querySelector('.amounts__current--p');
const totalIncomes = document.querySelector('.amounts__income--p');
const totalExpense = document.querySelector('.amounts__expense--p');

const entriesArray = localStorage.getItem('entries')
  ? JSON.parse(localStorage.getItem('entries'))
  : [];

if (entriesArray.length > 0) {
  renderEntries();
  renderAmounts();
}

function renderEntries() {
  incomesUl.innerHTML = '';
  expensesUl.innerHTML = '';
  entriesArray.forEach(obj => {
    const html = `
  <li class="transactions__${obj.type}--li" data-id="${obj.id}">
    <p class="transactions__description transactions__${obj.type}--p">${obj.desc}</p>
    <p class="transactions__value transactions__${obj.type}--p">${obj.value}
      <span class="edit">
        <i title="Edit entry" class="fa-solid fa-pen-to-square edit-icon"></i>
      </span>
      <span title="Delete entry" class="delete"><i class="fa-solid fa-trash-can delete-icon"></i
      ></span>
    </p>
  </li>`;

    document
      .querySelector(`.transactions__${obj.type}--ul`)
      .insertAdjacentHTML('beforeend', html);
  });
}

function clearFields() {
  description.value = '';
  amount.value = '';
}

function calculateAmount(arr, amountType) {
  return arr
    .filter(entry => entry.type === amountType)
    .map(entry => entry.value)
    .reduce((acc, curr) => acc + Number(curr), 0);
}

function formatAmount(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function renderAmounts() {
  const incomesSum = calculateAmount(entriesArray, 'incomes');
  const expensesSum = calculateAmount(entriesArray, 'expenses');
  const total = incomesSum - expensesSum;

  totalIncomes.textContent = formatAmount(incomesSum);
  totalExpense.textContent = formatAmount(expensesSum);
  totalSum.textContent = formatAmount(total);
}

function createEntry() {
  const entry = {};

  entry.type = inputTypeInc.checked ? 'incomes' : 'expenses';
  entry.desc = description.value;
  entry.value = amount.value;
  entry.id = entry.type.slice(0, 1).toUpperCase() + Date.now();

  if (entry.desc === '' || entry.value === '') {
    alert('Please fill in all fields!');
    clearFields();
    return;
  }

  entriesArray.push(entry);

  renderAmounts();
  clearFields();
}

function deleteEntry(arr, id) {
  // Map arr and transform it to element ID's
  const convertToId = arr.map(obj => obj.id);
  // Get index of the element to be deleted
  const index = convertToId.indexOf(id);
  // Delete element with current index
  arr.splice(index, 1);
  // Recalculate amounts after deletion
  renderAmounts();

  return arr;
}

// Event listeners

/*** Delete entry when clicked on the trash bin icon *** Event delegation ***/
transactionsDiv.addEventListener('click', e => {
  // Guard clause - return if click is outside the trash bin icon
  if (!e.target.classList.contains('delete-icon')) return;
  // Otherwise, remove parent of the clicked trash bin icon
  const parent = e.target.closest('li');
  // Retrieve id dataset attribute from parent to be deleted
  const entryId = parent.dataset.id;
  // Delete entry (parent) from entries array
  deleteEntry(entriesArray, entryId);
  // Delete entry (parent) from DOM
  parent.remove();
});

/*** Modify entry when clicked on edit icon *** Event delegation ***/
transactionsDiv.addEventListener('click', e => {
  // Guard clause - return if click is outside the edit icon
  if (!e.target.classList.contains('edit-icon')) return;
  // Get parent element
  const parent = e.target.closest('li');
  // Get parent ID
  const entryId = parent.dataset.id;
  // Get parent element innerHTML
  const parentLiInnerHTML = e.target.closest('li').innerHTML;
  // Determine from parents innerHTML if it is expenses or income element
  const type = parentLiInnerHTML.match(/expenses/) ? 'expenses' : 'incomes';
  // If 'expense' is checked and user click to modify an income element, selection will change, and vice versa
  type === 'expenses'
    ? (inputTypeExp.checked = true)
    : (inputTypeInc.checked = true);

  // Get and read old description and old value that will be edited
  const oldValues = Array.from(e.target.closest('li').children).map(
    el => el.innerText
  );

  // Insert old description text in the description field and focus it
  description.value = oldValues[0];
  description.focus();
  // Insert old amount value in the amount field
  amount.value = parseFloat(oldValues[1]);
  // Delete old entry
  deleteEntry(entriesArray, entryId);
  // Delete old parent
  parent.remove();
});

button.addEventListener('click', () => {
  createEntry();
  renderEntries();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    createEntry();
    renderEntries();
  }
  return;
});
// Save entriesArray in local storage before close/reload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('entries', JSON.stringify(entriesArray));
});
