document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDelete);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEdit);
    });

    const newPostForm = document.getElementById('newPostForm');
    if (newPostForm) {
        newPostForm.addEventListener('submit', handleNewPost);
    }
});

async function handleLike(event) {
    const postId = event.target.dataset.postId;
    try {
        const response = await fetch(`/like/take/${postId}`, { method: 'PUT' });
        const data = await response.json();

        if (response.ok) {
           
            const likeCountElement = document.querySelector(`#like-count-${postId}`);
            likeCountElement.innerText = `Likes: ${data.newLikeCount}`;
        } else {
            console.error('Error liking post:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleDelete(event) {
    const postId = event.target.dataset.postId;
    const username = localStorage.getItem('loggedInUser');

    if (confirm('Are you sure you want to delete this post?')) {
        const deleted = await deletePost(postId, username);
        if (deleted) {
            document.querySelector(`#post-${postId}`).remove();
        } else {
            alert('Oops, that\'s not your take');
        }
    }
}

function handleEdit(event) {
    const postId = event.target.dataset.postId;
    const postContent = document.querySelector(`#post-content-${postId}`).innerText;
    const newContent = prompt('Edit your post:', postContent);

    if (newContent && newContent !== postContent) {
        const username = localStorage.getItem('loggedInUser');
        editPost(postId, newContent, username);
    }
}

async function editPost(postId, content, username) {
    try {
        const response = await fetch('/edit/take', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId, take: content, username })
        });

        if (response.ok) {
            document.querySelector(`#post-content-${postId}`).innerText = content;
        } else if (response.status === 403) {
            alert('Oops, that\'s not your take');
        } else {
            console.error('Error editing post:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



async function handleNewPost(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = localStorage.getItem('loggedInUser');
    if (username) {
        formData.append('username', username);
    }

    const response = await fetch('/newTake', {
        method: 'POST',
        body: new URLSearchParams(formData)
    });

    if (response.ok) {
        window.location.reload();
    } else {
        alert('Failed to create post');
    }
}

async function deletePost(postId, username) {
    try {
        const response = await fetch(`/delete/take/${postId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            return true;
        } else if (response.status === 403) {
            return false;
        } else {
            console.error('Error deleting post:', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}