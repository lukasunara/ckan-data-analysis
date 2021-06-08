// sort list by newest date
var sortListByDate = async (ascending) => {
    // debugger;
    let list = document.getElementById("listOfElements");
    let elements = list.getElementsByTagName("LI");

    // let sortedArray = quickSortList(elements, 'date', ascending);
    let sortedArray = [];
    for (let i = 0; i < elements.length; i++) {
        sortedArray[i] = elements[i];
    }
    // debugger;
    sortedArray.sort((el1, el2) => {
        let el1Value = new Date(el1.dataset.date);
        let el2Value = new Date(el2.dataset.date);

        let result = 0;
        if (el1Value < el2Value) result = -1;
        else if (el1Value > el2Value) result = 1;

        return ascending ? result : -result;
    });
    // debugger;
    for (let i = 0; i < elements.length; i++) {
        list.replaceChild(sortedArray[i], elements[i]);
        // elements[i].replaceWith(sortedArray[i]);
    }

    // location.reload();
};

// sort list by name
var sortListByName = async (ascending) => {
    // debugger;
    let list = document.getElementById("listOfElements");
    let elements = list.getElementsByTagName("LI");

    // let sortedArray = quickSortList(elements, 'name', ascending);
    let sortedArray = [];
    for (let i = 0; i < elements.length; i++) {
        sortedArray[i] = elements[i];
    }
    // debugger;
    sortedArray.sort((el1, el2) => {
        let el1Value = el1.dataset.name;
        let el2Value = el2.dataset.name;
        let result = el1Value.localeCompare(el2Value);

        return ascending ? result : -result;
    });
    // debugger;
    for (let i = 0; i < elements.length; i++) {
        list.replaceChild(sortedArray[i], elements[i]);
        // elements[i].replaceWith(sortedArray[i]);
    }

    // location.reload();
};

// sort by name ascending
document.getElementById("sortByNameAscBtn").addEventListener('click', sortListByName(true));
// sort by name descending
document.getElementById("sortByNameDescBtn").addEventListener('click', sortListByName(false));
// sort by date ascending
document.getElementById("sortByDateAscBtn").addEventListener('click', sortListByDate(true));
// sort by date descending
document.getElementById("sortByDateDescBtn").addEventListener('click', sortListByDate(false));