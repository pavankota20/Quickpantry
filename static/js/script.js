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
    console.log(data)
    data.forEach(item => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'product-card';

        // Create card content container
        const content = document.createElement('div');
        content.className = 'product-card-content';

        // Product name
        const name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = item['product_name']; // Adjust according to your data structure

        // Add to cart button
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'add-to-cart-btn';
        //addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="22.5" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                <path fill="#009688" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20h44v44c0 11 9 20 20 20s20-9 20-20V180h44c11 0 20-9 20-20s-9-20-20-20H356V96c0-11-9-20-20-20s-20 9-20 20v44H272c-11 0-20 9-20 20z"/>
            </svg>`;
        // Add any event listener to addToCartBtn if needed
        
        addToCartBtn.addEventListener('click', function() {
            console.log(`Add ${item['product_name']} to cart`); // Implement your add to cart logic
        });

        // Assemble the card
        content.appendChild(name);
        content.appendChild(addToCartBtn);
        card.appendChild(content);
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
    
    const heading = document.createElement('div');
    heading.className = 'heading';
    heading.textContent = item;
    //heading.style.textAlign = "left";
    
    const content = document.createElement('div');
    content.className = 'results-container-' + x.toString();
    content.style.float = 'none';
    content.style.width = '100%';
    
    const scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.id = 'scroll-left-' + x.toString();
    scrollLeftBtn.setAttribute('aria-label', 'Scroll left');
    scrollLeftBtn.classList.add('scroll-button', 'left');
    scrollLeftBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 512 512">
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z"/>
        </svg>
    `;
    
    const resultsSection = document.createElement('div');
    resultsSection.id = 'results-section-' + x.toString();
    resultsSection.classList.add('scroll-button', 'middle');
    resultsSection.style.display = 'flex';
    resultsSection.style.flexWrap = 'nowrap';
    resultsSection.style.overflowX = 'auto'; // Enables horizontal scrolling
    resultsSection.style.WebkitOverflowScrolling = 'touch'; // Smooth scrolling on touch devices
    resultsSection.style.margin = '20px 0';
    resultsSection.style.marginLeft = '90px';
    resultsSection.style.paddingBottom = '20px';

    const scrollRightBtn = document.createElement('button');
    scrollRightBtn.id = 'scroll-right-' + x.toString();
    scrollRightBtn.setAttribute('aria-label', 'Scroll right');
    scrollRightBtn.classList.add('scroll-button', 'right');
    scrollRightBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 512 512">
            <path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"/>
        </svg>
    `;
    
    scrollLeftBtn.style.display = 'inline-block';
    scrollRightBtn.style.display = 'inline-block';

    content.appendChild(heading);
    content.appendChild(scrollLeftBtn);
    content.appendChild(resultsSection);
    content.appendChild(scrollRightBtn);
    resultsContainer.appendChild(content);
    
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
