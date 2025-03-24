document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-content');
    const postButton = document.getElementById('post-to-facebook');
    const previewContainer = document.getElementById('content-preview');
    const urlInput = document.getElementById('website-url');

    let selectedContent = { text: [], images: [] };

    // Fetch content from the backend
    fetchButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }

        try {
            const response = await fetch('/api/fetch-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch content.');
            }

            const data = await response.json();
            displayContent(data.text, data.images);
            postButton.disabled = false; // Enable the "Post to Facebook" button
        } catch (error) {
            alert(error.message || 'An error occurred while fetching content.');
        }
    });

    // Display fetched content in the UI
    function displayContent(texts, images) {
        previewContainer.innerHTML = '';

        // Add text snippets
        texts.forEach((text, index) => {
            const div = document.createElement('div');
            div.className = 'border p-2 rounded';
            div.textContent = text.length > 100 ? text.slice(0, 100) + '...' : text;

            // Allow selection
            div.addEventListener('click', () => {
                if (selectedContent.text.includes(text)) {
                    selectedContent.text = selectedContent.text.filter(t => t !== text);
                    div.style.backgroundColor = '';
                } else {
                    selectedContent.text.push(text);
                    div.style.backgroundColor = '#d1e7dd';
                }
            });

            previewContainer.appendChild(div);
        });

        // Add images
        images.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'rounded';

            // Allow selection
            img.addEventListener('click', () => {
                if (selectedContent.images.includes(imageUrl)) {
                    selectedContent.images = selectedContent.images.filter(imgUrl => imgUrl !== imageUrl);
                    img.style.border = '';
                } else {
                    selectedContent.images.push(imageUrl);
                    img.style.border = '2px solid #198754';
                }
            });

            previewContainer.appendChild(img);
        });
    }

    // Handle posting to Facebook
    postButton.addEventListener('click', async () => {
        if (selectedContent.text.length === 0 && selectedContent.images.length === 0) {
            alert('Please select some content to share.');
            return;
        }

        try {
            const message = selectedContent.text.join('\n');
            const imageUrls = selectedContent.images;

            const response = await fetch('/api/post-to-facebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, imageUrls })
            });

            if (!response.ok) {
                throw new Error('Failed to post to Facebook.');
            }

            alert('Content successfully posted to Facebook!');
        } catch (error) {
            alert(error.message || 'An error occurred while posting to Facebook.');
        }
    });
});
