//
document.addEventListener('DOMContentLoaded', function () {
  //get html elemnts store them in variables
  const registrationPage = document.getElementById('registrationPage');
  const resultsPage = document.getElementById('resultsPage');
  const previewResultsBtn = document.getElementById('previewResultsBtn');
  const backToFormBtn = document.getElementById('backToFormBtn');

  const regForm = document.getElementById('regForm');
  const successMessage = document.getElementById('successMessage');
  const liveRegion = document.getElementById('liveRegion');

  const viewCardsBtn = document.getElementById('viewCardsBtn');
  const viewTableBtn = document.getElementById('viewTableBtn');
  const cardsView = document.getElementById('cardsView');
  const tableView = document.getElementById('tableView');

  const cardsContainer = document.getElementById('cardsContainer');
  const summaryTable = document.getElementById('summaryTable').querySelector('tbody');

  //Load Saved Students
  let students = JSON.parse(localStorage.getItem('students')) || [];
  let editingEmail = null;

  students.forEach(student => addStudentToUI(student));

  previewResultsBtn.addEventListener('click', showResultsPage);
  backToFormBtn.addEventListener('click', showRegistrationPage);

  function showResultsPage() {
    registrationPage.classList.add('hidden');
    resultsPage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function showRegistrationPage() {
    resultsPage.classList.add('hidden');
    registrationPage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function validateRequired(value, fieldName) {
    return !value.trim() ? `${fieldName} is required.` : '';
  }
  function validateEmail(email) {
    if (!email) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|na)$/;
    return !emailRegex.test(email) ? 'Please enter a valid email (.com or .na).' : '';
  }
  function validateURL(url) {
    if (!url) return '';
    try {
      new URL(url);
      return '';
    } catch {
      return 'Please enter a valid URL.';
    }
  }
  function showError(fieldId, message) {
    const errorElement = document.getElementById(`err-${fieldId}`);
    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }

  regForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const programme = document.getElementById('programme').value;
    const year = document.querySelector('input[name="year"]:checked')?.value;
    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
      .map(cb => cb.value);
    const photo = document.getElementById('photo').value;

    let isValid = true;
    const firstNameError = validateRequired(firstName, 'First name');
    showError('firstName', firstNameError); if (firstNameError) isValid = false;

    const lastNameError = validateRequired(lastName, 'Last name');
    showError('lastName', lastNameError); if (lastNameError) isValid = false;

    const emailError = validateEmail(email);
    showError('email', emailError); if (emailError) isValid = false;

    const programmeError = validateRequired(programme, 'Programme');
    showError('programme', programmeError); if (programmeError) isValid = false;

    const yearError = !year ? 'Please select a year of study.' : '';
    showError('year', yearError); if (yearError) isValid = false;

    const photoError = validateURL(photo);
    showError('photo', photoError); if (photoError) isValid = false;

    if (!editingEmail && students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      showError('email', 'This email is already registered.');
      isValid = false;
    }

    if (!isValid) {
      liveRegion.textContent = 'Please fix the errors before submitting.';
      return;
    }

    const studentData = {
      firstName,
      lastName,
      email,
      programme,
      year,
      interests,
      photo: photo || 'https://placehold.co/400x300?text=Student+Photo'
    };

    if (editingEmail) {
      updateStudent(studentData);
    } else {
      addStudent(studentData);
    }

    successMessage.style.display = 'block';
    liveRegion.textContent = editingEmail ? 'Student updated!' : 'Student registered!';

    regForm.reset();
    editingEmail = null;

    setTimeout(() => {
      successMessage.style.display = 'none';
      showResultsPage();
    }, 1500);
  });

  function addStudent(data) {
    students.push(data);
    localStorage.setItem('students', JSON.stringify(students));
    addStudentToUI(data);
  }

  function updateStudent(data) {
    students = students.map(s => s.email === editingEmail ? data : s);
    localStorage.setItem('students', JSON.stringify(students));

    document.querySelector(`.card[data-email="${editingEmail}"]`)?.remove();
    document.querySelector(`tr[data-email="${editingEmail}"]`)?.remove();

    addStudentToUI(data);
  }

  function addStudentToUI(data) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.email = data.email;
    card.innerHTML = `
      <div class="card-img">
        <img src="${data.photo}" alt="${data.firstName} ${data.lastName}">
      </div>
      <h3 class="card-title">${data.firstName} ${data.lastName}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Programme:</strong> ${data.programme}</p>
      <p><strong>Year:</strong> ${data.year}</p>
      <p><strong>Interests:</strong> ${data.interests.join(', ') || 'None'}</p>
      <div class="card-actions">
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
      </div>
    `;
    card.querySelector('.remove-btn').addEventListener('click', () => removeStudent(data.email));
    card.querySelector('.edit-btn').addEventListener('click', () => startEdit(data.email));
    cardsContainer.prepend(card);

    const row = document.createElement('tr');
    row.dataset.email = data.email;
    row.innerHTML = `
      <td>${data.firstName} ${data.lastName}</td>
      <td>${data.programme}</td>
      <td>${data.year}</td>
      <td>${data.email}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
      </td>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => removeStudent(data.email));
    row.querySelector('.edit-btn').addEventListener('click', () => startEdit(data.email));
    summaryTable.prepend(row);
  }

  function removeStudent(email) {
    students = students.filter(s => s.email !== email);
    localStorage.setItem('students', JSON.stringify(students));
    document.querySelector(`.card[data-email="${email}"]`)?.remove();
    document.querySelector(`tr[data-email="${email}"]`)?.remove();
    liveRegion.textContent = 'Student removed.';
  }

  function startEdit(email) {
    const student = students.find(s => s.email === email);
    if (!student) return;

    document.getElementById('firstName').value = student.firstName;
    document.getElementById('lastName').value = student.lastName;
    document.getElementById('email').value = student.email;
    document.getElementById('programme').value = student.programme;
    document.querySelector(`input[name="year"][value="${student.year}"]`).checked = true;
    document.querySelectorAll('input[name="interests"]').forEach(cb => {
      cb.checked = student.interests.includes(cb.value);
    });
    document.getElementById('photo').value = student.photo;

    editingEmail = email;
    showRegistrationPage();
    liveRegion.textContent = 'Editing student. Make changes and save.';
  }

  viewCardsBtn.addEventListener('click', () => {
    viewCardsBtn.classList.add('active');
    viewTableBtn.classList.remove('active');
    cardsView.classList.remove('hidden');
    tableView.classList.add('hidden');
  });
  viewTableBtn.addEventListener('click', () => {
    viewTableBtn.classList.add('active');
    viewCardsBtn.classList.remove('active');
    tableView.classList.remove('hidden');
    cardsView.classList.add('hidden');
  });
});
