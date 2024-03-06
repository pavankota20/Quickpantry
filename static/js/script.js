document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    let debounceTimeout;

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
    
    /* document.getElementById('scroll-left').addEventListener('click', () => {
        document.getElementById('results-section').scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById('scroll-right').addEventListener('click', () => {
        document.getElementById('results-section').scrollBy({ left: 300, behavior: 'smooth' });
    }); */

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
        addToCartBtn.textContent = 'Add to Cart';
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
    heading.style.textAlign = "left";
    
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
    
    /* document.getElementById(scrollLeftBtn.id).addEventListener('click', () => {
        document.getElementById(resultsSection.id).scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById(scrollRightBtn.id ).addEventListener('click', () => {
        document.getElementById(resultsSection.id).scrollBy({ left: 300, behavior: 'smooth' });
    }); */

    content.appendChild(heading);
    content.appendChild(scrollLeftBtn);
    content.appendChild(resultsSection);
    content.appendChild(scrollRightBtn);
    resultsContainer.appendChild(content);
    displayResults(products, resultsSection.id);
}

/*
function displayResultsContainers(inputProducts) {
    const container = document.getElementById('results-container');
    container.innerHTML = ''; // Clear previous contents
    x = 0
    inputProducts.forEach(item => {
        const resultsContainer = createResultsContainer(item, x);
        container.appendChild(resultsContainer);
        x = x + 1
    });
}
*/

/* 
scrollLeftBtn.style.display = 'inline-block';
scrollRightBtn.style.display = 'inline-block';
scrollLeftBtn.style.display = 'none';
scrollRightBtn.style.display = 'none';
*/
