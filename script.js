document.addEventListener('DOMContentLoaded', function() {
    // Form and elements
    const form = document.getElementById('regForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const programme = document.getElementById('programme');
    const yearRadios = document.querySelectorAll('input[name="year"]');
    const interests = document.getElementById('interests');
    const liveRegion = document.getElementById('live');
    
    // Output containers
    const cardsContainer = document.getElementById('cards');
    const emptyCards = document.getElementById('empty-cards');
    const summaryTbody = document.getElementById('summaryTbody');
    
    // Student data store
    let students = [];
    
    // Validation functions
    function validateRequired(value, fieldName) {
        if (!value.trim()) {
            return `${fieldName} is required`;
        }
        return '';
    }
    
    function validateEmail(value) {
        if (!value) return 'Email is required';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return '';
    }
    
    
    // Field validation handlers
    function setupFieldValidation(field, validator, fieldName) {
        field.addEventListener('blur', function() {
            const error = validator(this.value, fieldName);
            showError(this, error);
        });
        
        field.addEventListener('input', function() {
            if (this.dataset.touched) {
                const error = validator(this.value, fieldName);
                showError(this, error);
            }
        });
        
        // Mark field as touched on first interaction
        field.addEventListener('blur', function() {
            this.dataset.touched = true;
        });
    }
    
    // Setup validation for each field
    setupFieldValidation(firstName, validateRequired, 'First name');
    setupFieldValidation(lastName, validateRequired, 'Last name');
    setupFieldValidation(email, validateEmail, 'Email');
    
    programme.addEventListener('change', function() {
        const error = validateRequired(this.value, 'Programme');
        showError(this, error);
    });
    
    // Setup radio validation
    const yearFieldset = document.querySelector('.radio-group');
    yearFieldset.addEventListener('change', function() {
        const selected = document.querySelector('input[name="year"]:checked');
        const error = selected ? '' : 'Year of study is required';
        
        const yearError = document.getElementById('err-year');
        yearError.textContent = error;
        
        if (error) {
            yearFieldset.style.border = '1px solid var(--danger)';
            yearFieldset.style.padding = '0.5rem';
            yearFieldset.style.borderRadius = '4px';
        } else {
            yearFieldset.style.border = 'none';
            yearFieldset.style.padding = '0';
        }
    });
    
    // Show error message
    function showError(field, error) {
        const errorElement = document.getElementById(`err-${field.id}`);
        errorElement.textContent = error;
        
        if (error) {
            field.style.borderColor = 'var(--danger)';
        } else {
            field.style.borderColor = '';
        }
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const firstNameError = validateRequired(firstName.value, 'First name');
        const lastNameError = validateRequired(lastName.value, 'Last name');
        const emailError = validateEmail(email.value);
        const programmeError = validateRequired(programme.value, 'Programme');
        const yearSelected = document.querySelector('input[name="year"]:checked');
        const yearError = yearSelected ? '' : 'Year of study is required';
        
        // Show errors
        showError(firstName, firstNameError);
        showError(lastName, lastNameError);
        showError(email, emailError);
        showError(programme, programmeError);
        
        const yearErrorElement = document.getElementById('err-year');
        yearErrorElement.textContent = yearError;
        
        if (yearError) {
            yearFieldset.style.border = '1px solid var(--danger)';
            yearFieldset.style.padding = '0.5rem';
            yearFieldset.style.borderRadius = '4px';
        } else {
            yearFieldset.style.border = 'none';
            yearFieldset.style.padding = '0';
        }
        
        
        // Check if there are any errors
        const hasErrors = firstNameError || lastNameError || emailError || 
                         programmeError || yearError;
        
        if (hasErrors) {
            liveRegion.textContent = 'Please fix the form errors before submitting';
            return;
        }
        
        // Create student object
        const student = {
            id: Date.now(), // Unique ID
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            programme: programme.value,
            year: yearSelected.value,
            interests: interests.value.split(',').map(i => i.trim()).filter(i => i),
        };
        
        // Add to data store
        students.push(student);
        
        // Create UI elements
        createProfileCard(student);
        addTableRow(student);
        
        // Announce success
        liveRegion.textContent = `Student ${student.firstName} ${student.lastName} has been registered successfully`;
        
        // Reset form
        form.reset();
        
        // Remove touched markers
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => delete field.dataset.touched);
    });
    
    // Create profile card
    function createProfileCard(student) {
        // Remove empty state if it exists
        if (emptyCards) {
            emptyCards.remove();
        }
        
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = student.id;
        
        let interestsHtml = '';
        if (student.interests.length > 0) {
            interestsHtml = `
                <div class="interests-list">
                    ${student.interests.map(interest => `<span>${interest}</span>`).join('')}
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-content">
                <h3>${student.firstName} ${student.lastName}</h3>
                <div>
                    <span class="badge">${student.programme}</span>
                    <span class="badge">Year ${student.year}</span>
                </div>
                <p>${student.email}</p>
                ${interestsHtml}
                <div class="card-actions">
                    <button class="btn-remove" onclick="removeStudent(${student.id})">Remove</button>
                </div>
            </div>
        `;
        
        cardsContainer.prepend(card);
    }
    
    // Add table row
    function addTableRow(student) {
        // Remove empty state if it exists
        if (summaryTbody.querySelector('.empty-state')) {
            summaryTbody.innerHTML = '';
        }
        
        const tr = document.createElement('tr');
        tr.dataset.id = student.id;
        
        tr.innerHTML = `
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.programme}</td>
            <td>Year ${student.year}</td>
            <td>
                <button class="btn-remove" onclick="removeStudent(${student.id})">Remove</button>
            </td>
        `;
        
        summaryTbody.prepend(tr);
    }
    
    // Remove student function (needs to be global for onclick)
    window.removeStudent = function(id) {
        // Remove from data store
        students = students.filter(student => student.id !== id);
        
        // Remove from UI
        const card = document.querySelector(`.card[data-id="${id}"]`);
        const tableRow = document.querySelector(`tr[data-id="${id}"]`);
        
        if (card) card.remove();
        if (tableRow) tableRow.remove();
        
        // Show empty states if no students left
        if (students.length === 0) {
            if (!document.getElementById('empty-cards')) {
                const emptyCards = document.createElement('div');
                emptyCards.id = 'empty-cards';
                emptyCards.className = 'empty-state';
                emptyCards.innerHTML = '<p>No student profiles yet. Register a student to see their profile card here.</p>';
                cardsContainer.appendChild(emptyCards);
            }
            
            summaryTbody.innerHTML = '<tr><td colspan="4" class="empty-state">No students registered yet</td></tr>';
        }
        

        liveRegion.textContent = 'Student has been removed';
    };
});