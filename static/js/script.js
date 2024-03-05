document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
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
            fetch(`/find_similar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_name: inputProduct })
            })
            .then(response => response.json())
            .then(data => {
                clearSuggestions();
                resultsSection.innerHTML = ''; // Clear the loading message or previous results
                
                if (data.length === 0) {
                    resultsSection.innerHTML = '<p>No similar products found.</p>';
                    scrollLeftBtn.style.display = 'none';
                    scrollRightBtn.style.display = 'none';
                    return;
                }
                displayResults(data)
                scrollLeftBtn.style.display = 'inline-block';
                scrollRightBtn.style.display = 'inline-block';
            })
            .catch(error => {
                console.error('Error:', error);
                resultsSection.innerHTML = '<p>Error fetching similar products. Please try again later.</p>';
                scrollLeftBtn.style.display = 'none';
                scrollRightBtn.style.display = 'none';
            });
        } else {
            resultsSection.innerHTML = '<p>Please enter a product name to search for similar products.</p>';
            scrollLeftBtn.style.display = 'none';
            scrollRightBtn.style.display = 'none';
        }
        
    });
    
    document.getElementById('scroll-left').addEventListener('click', () => {
        document.getElementById('results-section').scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById('scroll-right').addEventListener('click', () => {
        document.getElementById('results-section').scrollBy({ left: 300, behavior: 'smooth' });
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


function displayResults(data) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = ''; // Clear previous results

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



