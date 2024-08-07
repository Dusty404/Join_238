/**
 * Check selected contacts and highlights the selected contacts.
 */
function processSelectedContacts() {
    // Check if the selectedContacts array exists and has at least one element
    if (selectedContacts && selectedContacts.length > 0) {
        // Iterate over each contact in the selectedContacts array
        selectedContacts.forEach(contact => {
            // Extract and convert i and y from index
            const [i, y] = contact.index.split('-').map(Number);
            // Highlight the contact based on extracted indices
            highlightContactEdit(i, y);
        });
    }
}


/**
 * Hides the edit overlay and removes HTML content.
 */
function hideAndRemoveEditOverlay() {
    let editTaskForm = document.getElementById('taskEditForm');
    if (editTaskForm) {
        displayNone('editOverlay');
        editTaskForm.parentNode.removeChild(editTaskForm);
    }
}


/**
 * Contacts from array 'selectedContacts' will be shown as selected/highlighted, 
 * if no contacts have been selected previously, contact list will be rendered.
 */
function showContactDrpEdit() {
    document.getElementById('contact-drp-dwn').classList.toggle('d-none');
    document.getElementById('arrow-drp-dwn').classList.toggle('flip-vertically');
}


/**
 * Contact list from array will be sorted
 */
function createContactDrpDwnEdit() {
    let contactDrpDwn = document.getElementById('contact-content');
    contactDrpDwn.innerHTML = "";

    for (let i = 0; i < alphabetContainer.length; i++) {
        const sortLetterNr = alphabetContainer[i];
        showContactInDrpDwnEdit(sortLetterNr, i);
    }
}


/**
 * Calls the contacts and renders them to drop-down list.
 * @param {*} sortLetterNr 
 * @param {*} i 
 */
function showContactInDrpDwnEdit(sortLetterNr, i) {
    for (let y = 0; y < sortLetterNr['list'].length; y++) {
        const LetterContactNr = sortLetterNr['list'][y];
        printContactDrpDwnEdit(LetterContactNr, y, i);
    }
}


/**
 * Highlights selected contacts from dropdown list
 * @param {number} i List in JSON 'alphabetContainer'
 * @param {number} y Value from i list in 'alphabetContainer'
 */
function highlightContactEdit(i, y) {
    let contactElement = document.getElementById(`contact-in-list${i}-${y}`);
    
    // Check if the contactElement has the class 'selected-contact'
    if (contactElement.classList.contains('selected-contact')) {
        // If it has the class, remove it
        contactElement.classList.remove('selected-contact');
        removeFromSelectedContactsEdit(i, y);
    } else {
        // If it does not have the class, add it
        contactElement.classList.add('selected-contact');
        addToSelectedContactsEdit(contactElement, i, y);
    }
    
    // Toggle the visibility of the check and checked buttons
    document.getElementById(`checked-button${i}-${y}`).classList.toggle('d-none');
    document.getElementById(`check-button${i}-${y}`).classList.toggle('d-none');
}

/**
 * updates the array 'selectedContacts' with newly selected contacts
 * @param {HTMLElement} contactElement newly selected contact
 * @param {number} i 
 * @param {number} y 
 */
function addToSelectedContactsEdit(contactElement, i, y) {
    const color = contactElement.querySelector('.initialsContact-small').style.background;
    const initials = contactElement.querySelector('.initialsContact-small').innerText;
    const name = contactElement.querySelector('span').innerText;
    const contactIndex = `${i}-${y}`;

    // Check if the contact is already in the selectedContacts array
    const contactExists = selectedContacts.some(contact => contact.index === contactIndex);

    // Only add the contact if it does not already exist in the selectedContacts array
    if (!contactExists) {
        selectedContacts.push({ index: contactIndex, color, initials, name });
        generateAssignedContacts();
    }
}


/**
 * Removes the contact from the array 'selectedContacts'
 * @param {HTMLElement} contactElement Contact to be removed
 * @param {number} i 
 * @param {number} y 
 */
function removeFromSelectedContactsEdit(i, y) {
    const indexToRemove = `${i}-${y}`;
    selectedContacts = selectedContacts.filter(contact => contact.index !== indexToRemove);

    generateAssignedContacts();
}


/**
 * Renders the overlay to edit the task
 * @param {*} index 
 * @param {*} taskCategory 
 * @param {*} taskTitle 
 */
function editTaskOverlay(index, taskCategory, taskTitle) {
    displayElement('editOverlay');
    subTaskList = tasks[taskCategory][index].subTaskList || []; // Ensure subTaskList is an array
    priority =  tasks[taskCategory][index].priority;
    let editTaskOverlay = document.getElementById('editOverlay');
    let task = tasks[taskCategory][index];
    selectedContacts = task.selectedContacts || [];
    editTaskOverlay.innerHTML = generateOverlayEdit(task, taskCategory);
    attachEventListeners();
    renderEditSubTaskList();
    createContactDrpDwnEdit();
    task = [];
    processSelectedContacts();
    // Delay execution of loadSelectedInitialIcosEditWindow by 100 milliseconds
    setTimeout(function() {
        generateAssignedContacts();
    }, 100);
}


/**
 * Shows the icons of contacts below the drop-down menu and adds a small icon with summary if more than 6 contacts are selected
 */
function generateAssignedContacts() {
    // Get the element where the HTML for the assigned contacts will be placed
    let assignedContactsContainer = document.getElementById('selected-initial-ico');

    // Check if selectedContacts is defined, if not, use an empty array
    let contacts = selectedContacts || [];

    // Initialize an empty string to hold the HTML content
    let assignedContactsHtml = '';

    // Loop through each contact in the contacts array, up to a maximum of 4
    for (let i = 0; i < Math.min(contacts.length, 6); i++) {
        let contact = contacts[i];
        // Create an HTML string for each contact with their initials and background color
        assignedContactsHtml += `
            <div class="initialsContact-small" style="background: ${contact.color}">
                ${contact.initials}
            </div>
        `;
    }

    // If there are more than 6 contacts, add a summary div
    if (contacts.length > 6) {
        let additionalCount = contacts.length - 6;
        assignedContactsHtml += `<div class="initialsContact-small">+${additionalCount}</div>`;
    }

    // Set the innerHTML of the container to the generated HTML
    assignedContactsContainer.innerHTML = assignedContactsHtml;
}

/**
 * Renders the subtask list in the edit overlay and adds event listener for double-click
 */
function renderEditSubTaskList() {
    let subTaskListHTML = document.getElementById('sub-task-list');
    subTaskListHTML.innerHTML = '';

    if (subTaskList && subTaskList.length > 0) { // Check if subTaskList is defined and not empty
        for (let i = 0; i < subTaskList.length; i++) {
            let subTask = subTaskList[i];

            subTaskListHTML.innerHTML += /*html*/ `
                        <div id="sub-task-entry${i}" class="highlight-subtask sub-task-entry">
                            <li id="subtask-in-list${i}">${subTask.name}</li>
                            <div class="sub-task-buttons" style="display: none">
                                <img id="edit-small-img${i}" onclick="editTaskInEditList(${i})" class="plus" src="./img/edit-small.svg" alt="">
                                <img src="./img/separator-small.svg" class="sep-small" alt="">
                                <img id="recycle-small-img${i}" onclick="deleteEditSubtaskHTML(${i})" class="plus" src="./img/recycle.svg" alt="">
                            </div>
                        </div>
                    `;
        }

        // Attach double-click event listeners for the displayed entries
        for (let i = 0; i < subTaskList.length; i++) {
            let subTaskEntry = document.getElementById(`sub-task-entry${i}`);
            subTaskEntry.addEventListener('dblclick', () => {
                editSubTaskInList(subTaskList, i);
            });
        }
    }
}


/**
 * Edits the subtask in the edit task overlay
 * @param {*} index 
 */
function editTaskInEditList(index) {
    let subTaskElement = document.getElementById(`subtask-in-list${index}`);
    let currentTask = subTaskList[index];
    let firstButtonImg = document.getElementById(`edit-small-img${index}`);
    let secondButtonImg = document.getElementById(`recycle-small-img${index}`);

    subTaskElement.innerHTML = /*html*/ `
        <input type="text" id="edited-sub-task-${index}" value="${currentTask.name}">
    `;

    firstButtonImg.src = './img/recycle.svg';
    firstButtonImg.onclick = function () {
        deleteEditSubtaskHTML(index);
    };

    secondButtonImg.src = './img/check-small.svg';
    secondButtonImg.onclick = function () {
        saveEditedTask(index);
    };
    changeParentStyle(index);
}


/**
 * Saves the edited subtask in the edit overlay
 * @param {*} index 
 */
function saveEditedTask(index) {
    let editedTaskElement = document.getElementById(`edited-sub-task-${index}`);
    let editedTask = editedTaskElement.value.trim();

    if (editedTask) {
        subTaskList[index].name = editedTask;
        renderEditSubTaskList();
    } else {
        console.error("Edited subtask is empty");
    }
}


/**
 * Deletes subtask in edit overlay
 * @param {} index 
 */
function deleteEditSubtaskHTML(index) {
    subTaskList.splice(index, 1);
    renderEditSubTaskList();
}


/**
 * Edit function fur subtasks
 * @param {*} subTaskList 
 * @param {*} index 
 */
function editSubTaskInList(subTaskList, index) {
    let subTaskElement = document.getElementById(`subtask-in-list${index}`);
    let currentTask = subTaskList[index];
    let firstButtonImg = document.getElementById(`edit-small-img${index}`);
    let secondButtonImg = document.getElementById(`recycle-small-img${index}`);

    // Create the new div element
    let newDivElement = document.createElement('div');
    newDivElement.id = `subtask-in-list${index}`; // Preserve the original ID
    newDivElement.innerHTML = /*html*/ `
        <input type="text" id="edited-sub-task-${index}" value="${currentTask.name}">
    `;

    // Replace the original li element with the new div element
    subTaskElement.parentNode.replaceChild(newDivElement, subTaskElement);

    firstButtonImg.src = './img/recycle.svg';
    firstButtonImg.onclick = function () {
        deleteEditSubtaskHTML(index);
    };

    secondButtonImg.src = './img/check-small.svg';
    secondButtonImg.onclick = function () {
        saveEditedSubTask(subTaskList, index);
    };

    changeParentStyle(index);
}


/**
 * Save function for subtasks
 * @param {*} subTaskList 
 * @param {*} index 
 */
function saveEditedSubTask(subTaskList, index) {
    let editedTaskElement = document.getElementById(`edited-sub-task-${index}`);
    let editedTask = editedTaskElement.value.trim();

    if (editedTask) {
        subTaskList[index].name = editedTask;
        renderEditSubTaskList(subTaskList);
    } else {
        console.error("Edited subtask is empty");
    }
}


/**
 * Push edited subtask to subTaskList
 */
function pushToEditedSubTaskList() {
    let newSubtask = document.getElementById('taskSub').value;

    // Check if newSubtask has at least one character
    if (newSubtask.length >= 1) {
        subTaskList.push({ name: newSubtask, complete: false });
        resetInput();
        alternateTwoElements('subtask-plus', 'subtask-buttons');
        renderEditSubTaskList();
    }
}


/**
 * updates selected contacts in selectedContacts array 
 * @param {*} contactElement 
 * @param {*} isSelected 
 * @param {*} i 
 * @param {*} y 
 */
function updateSelectedContactsEdit(contactElement, isSelected, i, y) {
    const color = contactElement.querySelector('.initialsContact-small').style.background;
    const initials = contactElement.querySelector('.initialsContact-small').innerText;
    const name = contactElement.querySelector('span').innerText;


    if (isSelected) {
        // Add to selectedContacts
        selectedContacts.push({ color, index: `${i}-${y}`, initials, name });
    } else {
        // Remove from selectedContacts
        selectedContacts = selectedContacts.filter(contact => contact.index !== `${i}-${y}`);
    }
}


/**
 * Creates a task in the corresponding list and firebase
 * @param {string} oldTaskTitle - The old title of the task
 * @param {string} newTaskTitle - The new title of the task
 * @param {string} boardStatus - The status of the board (e.g., 'toDo', 'inProgress', 'done')
 */
async function saveChangesTask(oldTaskTitle, newTaskTitle, boardStatus) {
    if (!accName) {
        saveChangesTaskToLocalStorage(oldTaskTitle, newTaskTitle, boardStatus);
    } else {
        let taskDescription = document.getElementById('taskDescription').value;
        let taskDate = document.getElementById('taskDate').value;

        let dataToSend = {
            selectedContacts: selectedContacts,
            subTaskList: subTaskList,
            priority: priority,
            chosenCategory: chosenCategory,
            taskDescription: taskDescription,
            taskDate: taskDate
        };

        let baseUrl = BASE_URL + "tasks/" + accName + "/" + boardStatus + "/";
        let oldTaskUrl = baseUrl + oldTaskTitle + ".json";
        let newTaskUrl = baseUrl + newTaskTitle + ".json";

        try {
            // If the task title has changed, update the Firebase record under the new title and delete the old one
            if (oldTaskTitle !== newTaskTitle) {
                // Save the task data under the new title
                let response = await fetch(newTaskUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (response.ok) {
                    // Delete the old task record
                    await fetch(oldTaskUrl, {
                        method: "DELETE"
                    });

                    // Check the current page and update the UI accordingly
                    if (window.location.pathname.endsWith("addTask.html")) {
                        displayElement('task-scc-add-ntn');
                        setTimeout(openBoardPage, 900);
                    } else if (window.location.pathname.endsWith("board.html")) {
                        load();
                        displayNone('addTaskWindow');
                    }
                } else {
                    console.log("Error updating task.");
                }
            } else {
                // If the task title hasn't changed, just update the existing record
                let response = await fetch(newTaskUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (response.ok) {
                    if (window.location.pathname.endsWith("addTask.html")) {
                        displayElement('task-scc-add-ntn');
                        setTimeout(openBoardPage, 900);
                    } else if (window.location.pathname.endsWith("board.html")) {
                        load();
                        displayNone('addTaskWindow');
                    }
                } else {
                    console.log("Error creating task.");
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}


/**
 * Creates a task in the corresponding list and local storage
 * @param {string} oldTaskTitle - The old title of the task
 * @param {string} newTaskTitle - The new title of the task
 * @param {string} boardStatus - The status of the board (e.g., 'toDo', 'inProgress', 'done')
 */
function saveChangesTaskToLocalStorage(oldTaskTitle, newTaskTitle, boardStatus) {
    let taskDescription = document.getElementById('taskDescription').value;
    let taskDate = document.getElementById('taskDate').value;

    let dataToSend = {
        id: newTaskTitle,
        selectedContacts: selectedContacts,
        subTaskList: subTaskList,
        priority: priority,
        chosenCategory: chosenCategory,
        taskDescription: taskDescription,
        taskDate: taskDate
    };

    // Retrieve existing tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    tasks[boardStatus] = tasks[boardStatus] || [];

    // Find the index of the old task if it exists
    let oldTaskIndex = tasks[boardStatus].findIndex(task => task.id === oldTaskTitle);

    // If the task title has changed or it's a new task, update or add the task
    if (oldTaskIndex !== -1) {
        // Update existing task if the title has changed
        if (oldTaskTitle !== newTaskTitle) {
            tasks[boardStatus][oldTaskIndex] = dataToSend;
        } else {
            // Remove the old task if the title has changed
            tasks[boardStatus].splice(oldTaskIndex, 1);
            // Add the new task to the end of the list
            tasks[boardStatus].push(dataToSend);
        }
    } else {
        // Add new task
        tasks[boardStatus].push(dataToSend);
    }

    // Save the updated tasks back to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Check the current page and update the UI accordingly
    if (window.location.pathname.endsWith("addTask.html")) {
        displayElement('task-scc-add-ntn');
        setTimeout(openBoardPage, 900);
    } else if (window.location.pathname.endsWith("board.html")) {
        load();
        displayNone('addTaskWindow');
    }
}




/**
 * Check if all required fields are filled
 */
function attachEventListeners() {
    const taskDateInput = document.getElementById('taskDate');
    const taskTitleInput = document.getElementById('task-title1');

    if (taskDateInput) {
        taskDateInput.addEventListener('input', validateDateEdited);
    }

    if (taskTitleInput) {
        taskTitleInput.addEventListener('input', validateTitleEdited);
    }

    // Check if both inputs are not empty when created and validate
    if (taskDateInput && taskTitleInput) {
        validateFormEdited();
    }
}


/**
 * Validates form
 */
function validateDateEdited() {
    const taskDateInput = document.getElementById('taskDate');
    let errorSpan = document.getElementById('errorDate');

    const taskDate = taskDateInput.value;

    const selectedDate = new Date(taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        errorSpan.textContent = "Please select a future date.";
    } else {
        errorSpan.textContent = "";
    }
    validateFormEdited(); // Call validateFormEdited after validation
}


/**
 * Check if title was entered
 */
function validateTitleEdited() {
    const taskTitleInput = document.getElementById('task-title1');
    let errorSpan = document.getElementById('titleError');

    const taskTitle = taskTitleInput.value.trim();

    if (!taskTitle) {
        errorSpan.textContent = "Task title must not be empty.";
    } else {
        errorSpan.textContent = "";
    }
    validateFormEdited(); // Call validateFormEdited after validation
}


/**
 * Check if everything is filled and valid
 * @returns 
 */
function validateFormEdited() {
    const taskDateInput = document.getElementById('taskDate');
    const taskTitleInput = document.getElementById('task-title1');
    const submitButton = document.getElementById('save-changes-bttn');

    if (!taskDateInput || !taskTitleInput) {
        submitButton.disabled = true;
        return;
    }

    const taskDate = new Date(taskDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskTitle = taskTitleInput.value.trim();

    if (taskTitle && taskDate >= today) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}


// Ensure the functions are available globally if needed
window.attachEventListeners = attachEventListeners;


/**
 * Save edited task hide the overlay menu and remove black background
 * @param {*} oldTaskTitle 
 * @param {*} taskCategory 
 * @returns 
 */
function saveEditedTaskEvent(oldTaskTitle, taskCategory) {
    let taskTitle = document.getElementById('task-title1').value;
    chosenCategory = [];
    let category = document.getElementById('selected-category').innerText;
    chosenCategory.push(category);
    taskTitle = String(taskTitle);
    saveChangesTask(oldTaskTitle, taskTitle, taskCategory);
    displayNone('task-overlay');
    hideAndRemoveEditOverlay();
    hideBackGrnd('transparentBackGrnd');
    return false;
}
