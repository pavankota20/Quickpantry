var userIdElement = document.getElementById('userId');
var userId = userIdElement.getAttribute('data-user-id');

document.addEventListener("DOMContentLoaded", function() {
    
    const inputField = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    let debounceTimeout;

    initialRecommendations()
    
    inputField.addEventListener("input", function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = inputField.value.trim();

            if (searchTerm.length > 0) {
                fetch(`/autocomplete?term=${encodeURIComponent(searchTerm)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        displaySuggestions(data);
                        
                    } else {
                        displayNoSuggestions();
                        
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    displayFetchError();
                    
                });
            } else {
                clearSuggestions();
                
            }
        }, 300); // Debounce time of 300 milliseconds
    });

    // Add this part for the search button functionality
    searchButton.addEventListener('click', function() {
        const inputProduct = inputField.value.trim();
        const resultsSection = document.getElementById('results-section');

        resultsSection.innerHTML = '<p>Loading...</p>';

        if (inputProduct.length > 0) {
            fetch(`/intent_classification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_name: inputProduct })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                manageClassification(data, inputProduct);
            })
            .catch(error => {
                console.error('Error:', error);
                resultsSection.innerHTML = '<p>Error processing your request. Please try again.</p>';
            });
        } else {
            resultsSection.innerHTML = '<p>Please enter a product name to search for similar products.</p>';
        }
        
    });

});


function displaySuggestions(suggestions) {
    const autocompleteList = document.getElementById('autocomplete-list');

    clearSuggestions(); // Clears the list before displaying new suggestions

    const list = document.createElement('ul');
    list.setAttribute('role', 'listbox');
    autocompleteList.appendChild(list);

    suggestions.slice(0, 5).forEach(suggestion => {
        const item = document.createElement('li');
        item.setAttribute('role', 'option');
        item.setAttribute('class', 'autocomplete-listitem');
        item.textContent = suggestion;
        item.addEventListener('click', function() {
            document.getElementById('search-input').value = suggestion;
            clearSuggestions();
        });
        list.appendChild(item);
    });
}

function clearSuggestions() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';

}

function displayNoSuggestions() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.textContent = 'No suggestions found';
}

function displayFetchError() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.textContent = 'Error fetching suggestions';
}


function displayResults(data, resultsSectionId) {
    const resultsSection = document.getElementById(resultsSectionId);
    resultsSection.innerHTML = ''; // Clear previous results
    
    data.forEach(item => {     
        const card = document.createElement('div');
        card.className =  'flex-none w-48 bg-white rounded-lg shadow-md p-4';
        
        const cardContent = document.createElement('div');
        cardContent.className = 'text-center text-sm';
        cardContent.textContent = item['product_name']; 
        
        card.appendChild(cardContent);
        resultsSection.appendChild(card);
    });
}

function manageClassification(data, inputProduct) {
    classification = data['intent'];
    if (classification == 'Cooking'){
        getRecipeItems(inputProduct)
    }
    else {
        getSimilarProducts([inputProduct])
    }
}

function getRecipeItems(inputProduct) {
    const resultsSection = document.getElementById('results-section');
    if (inputProduct.length > 0) {
        fetch(`/get_recipe_ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_name: inputProduct })
        })
        .then(response => response.json())
        .then(data => {
            getSimilarProducts(data['ingredients'])
        })
        .catch(error => {
            console.error(error)
            resultsSection.innerHTML = '<p>Error processing your request. Please try again.</p>';
        });
    } else {
        resultsSection.innerHTML = '<p>Please enter a product name to search for similar products.</p>';
    }
}

function getSimilarProducts(inputProduct) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    x = 0
    inputProduct.forEach(item => {
        if (item.length > 0) {
            fetch(`/find_similar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_name: item })
            })
            .then(response => response.json())
            .then(data => {
                clearSuggestions();
                resultsSection.innerHTML = '';
                
                if (data.length === 0) {
                    resultsSection.innerHTML = '<p>No similar products found.</p>';
                    return;
                }
                else {
                    displayResultsContainers(item, data, x)
                    x = x + 1
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultsSection.innerHTML = '<p>Error fetching similar products. Please try again later.</p>';
            });
        } else {
            resultsSection.innerHTML = '<p>Please enter a product name to search for similar products.</p>';
        }
    })
    
}

function displayResultsContainers(item, products, x) {
    const resultsContainer = document.getElementById('results-container');
    
    const body = document.createElement('div');
    body.className = 'results-container-' + x.toString();
    
    const heading = document.createElement('div');
    heading.className = 'flex items-center justify-between';
    //var classes = ['flex', 'items-center', 'justify-between'];
    //heading.classList.add(classes);
    
    const heading_1 = document.createElement('div');
    heading_1.className = 'text-xl font-semibold';
    heading_1.textContent = item;
    
    const content = document.createElement('div');
    content.className = 'flex items-center';
    
    const scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.className = 'text-2xl text-gray-600 mr-4';
    
    const leftIcon = document.createElement('i');
    scrollLeftBtn.id = 'scroll-left-' + x.toString();
    leftIcon.className = 'fas fa-chevron-left';
    
    const scrollRightBtn = document.createElement('button');
    scrollRightBtn.id = 'scroll-right-' + x.toString();
    scrollRightBtn.className = 'text-2xl text-gray-600';
    
    const rightIcon = document.createElement('i');
    rightIcon.className = 'fas fa-chevron-right';
    
    scrollLeftBtn.appendChild(leftIcon);
    scrollRightBtn.appendChild(rightIcon);
    content.appendChild(scrollLeftBtn);
    content.appendChild(scrollRightBtn);
    heading.append(heading_1);
    heading.append(content);
    body.appendChild(heading);
    
    const resultsSection = document.createElement('div');
    resultsSection.id = 'results-section-' + x.toString();
    resultsSection.className = 'flex overflow-x-auto py-6 space-x-4';
    body.appendChild(resultsSection);
    resultsContainer.append(body);
    
    document.getElementById(scrollLeftBtn.id).addEventListener('click', () => {
        document.getElementById(resultsSection.id).scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById(scrollRightBtn.id ).addEventListener('click', () => {
        document.getElementById(resultsSection.id).scrollBy({ left: 300, behavior: 'smooth' });
    });
    
    displayResults(products, resultsSection.id);
}


function initialRecommendations() {
    fetch(`/initialRecommendations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ logged_in_user: userId })
    })
    .then(response => response.json())
    .then(data => {
        displayResultsContainers('Recommendations', data, 0)
    })
}
