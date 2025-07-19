// Save API key to IndexedDB
document.getElementById('api-key-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const apiKey = document.getElementById('api-key-input').value;
    if (!apiKey) return;

    // Open (or create) the IndexedDB
    const request = createDB();

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('apiKey', 'readwrite');
        const store = tx.objectStore('apiKey');

        store.put({ id: 1, key: apiKey }).onsuccess = function () {
            alert('API Key saved!');
            document.getElementById('api-key-input').value = apiKey;
        }
    };
    request.onerror = function () {
        alert('Failed to save API Key.');
    };
});

// function to retrieve the API key from IndexedDB and set it in the input field
const retrieveApiKey = () => {
    const dbRequest = createDB();
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("apiKey", "readonly");
        const store = transaction.objectStore("apiKey");
        const getRequest = store.get(1);
        getRequest.onsuccess = function () {
            const apiKey = getRequest.result?.key;
            document.getElementById('api-key-input').value = apiKey || '';
        };
    };
}

//change the model variable when the model selector is changed
let model = "moonshotai/kimi-dev-72b:free"; // Default model
document.getElementById("model-selector").addEventListener("change", (event) => {
    const selectedModel = event.target.value;
    model = selectedModel;
});

// Function to parse markdown text to HTML
// This function will convert markdown syntax to HTML tags for rendering in the chat messages
// It supports h1, h2, h3 tags, bold text, and italic text
const markdownParser = (text) => {
    const toHTML = text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')  // h3 tag
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')   // h2 tag
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')    // h1 tag
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')  // bold
        .replace(/\*(.+?)\*/g, '<i>$1</i>');     // italic
    return toHTML.trim();
};

// Function to create the IndexedDB database if not exists
const createDB = () => {
    const request = indexedDB.open("Dhall AI", 1);

    request.onupgradeneeded = function () {
        const db = request.result;
        const store = db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
        store.createIndex("id", "id", { unique: true });

        const apiKeyStore = db.createObjectStore("apiKey", { keyPath: "id" });
        apiKeyStore.createIndex("id", "id", { unique: true });
    }

    return request;
}

const createNewChat = async () => {
    const dbRequest = createDB();

    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("chats", "readwrite");
        const store = transaction.objectStore("chats");
        // Add your chat creation logic here
        store.add({ title: "New Chat", messages: [] }).onsuccess = function (event) {
            store.put({ id: event.target.result, title: `Chat ${event.target.result}`, messages: [] });
            openChat(event.target.result); // Open the newly created chat
            window.location.href = `?id=${event.target.result}`; // Update the URL with the new chat ID
        }
    }
}

//update chat menu function
const updateChatMenu = async () => {
    const dbRequest = createDB();
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("chats", "readonly");
        const store = transaction.objectStore("chats");
        const allChatsRequest = store.getAll();
        allChatsRequest.onsuccess = function () {
            const chats = allChatsRequest.result;

            document.getElementById("chat-list").innerHTML = ""; // Clear existing chat list
            chats.reverse().forEach((chat, index) => {
                document.getElementById("chat-list").innerHTML += `
                    <li class="group flex items-center hover:bg-blue-100 rounded-lg mb-2" id="chat-${chat.id}">
                            <a href="?id=${chat.id}"
                                class="flex items-center w-full px-3 py-2 rounded-lg text-blue-700 font-medium relative" onclick="openChat(${chat.id})">
                                <span class="mr-2 text-xs text-gray-400">${index + 1}.</span>
                                <span class="truncate flex-1">${chat.title}</span>
                            </a>
                            <button
                                class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                title="Delete Chat" onclick="deleteChat(${chat.id})">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                `;
            });

            const urlParams = new URLSearchParams(window.location.search);
            const chatId = urlParams.get("id");
            document.getElementById(`chat-${chatId}`).classList.add("bg-blue-100");

        };
    };
}

// delete chat function
const deleteChat = (chatId) => {
    const dbRequest = createDB();
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("chats", "readwrite");
        const store = transaction.objectStore("chats");
        const deleteRequest = store.delete(chatId);
        deleteRequest.onsuccess = function () {
            const c = confirm(`Are you sure you want to delete this chat`);
            c ? window.location.reload() : ""; // Update the chat menu after deletion
        };
        deleteRequest.onerror = function () {
            console.error(`Error deleting chat with ID ${chatId}.`);
        };
    };
}

// Function to scroll to the bottom of the chat messages
const scrollToBottom = () => {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Function to open a chat
const openChat = (chatId) => {
    const dbRequest = createDB();
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("chats", "readonly");
        const store = transaction.objectStore("chats");
        const getRequest = store.get(chatId);

        getRequest.onsuccess = function () {

            const chat = getRequest.result;

            if (chat) {
                // Here you can implement the logic to display the chat messages
                // change the chat title
                const chatTitleElement1 = document.getElementById("chat-title");
                const chatTitleElement2 = document.getElementById("chat-title2");

                chatTitleElement1.textContent = chat.title;
                chatTitleElement2.textContent = chat.title;

                document.getElementById("chat-messages").innerHTML = ""; // Clear existing messages

                // show the chat messages
                loadChatMessages(chat);

                // set the chatId in the form
                const sendMessageForm = document.getElementById("send-message-form");
                sendMessageForm.setAttribute("onsubmit", `sendMessage(event, ${chatId})`);
            } else {
                console.error(`Chat with ID ${chatId} not found.`);
            }
        };
        getRequest.onerror = function () {
            console.error(`Error retrieving chat with ID ${chatId}.`);
        };
    };
}

// function to load the messages of the chat
const loadChatMessages = (chat) => {
    document.getElementById("chat-messages").innerHTML = ""; // Clear existing messages

    // show the chat messages
    chat.messages.forEach((message) => {
        const chatMessages = document.getElementById("chat-messages");
        const messageDiv = document.createElement("div");
        messageDiv.className = message.role === "user"
            ? "flex justify-end"
            : "flex";
        const innerDiv = document.createElement("div");
        innerDiv.className = message.role === "user"
            ? "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-sm lg:max-w-2xl"
            : "bg-blue-500 text-white px-4 py-2 rounded-lg max-w-sm lg:max-w-2xl";
        innerDiv.style.whiteSpace = "pre-wrap"; // Preserve whitespace and line breaks
        //remove the content between ◁think▷ and ◁/think▷
        message.content = message.content.replace(/◁think▷[\s\S]*?◁\/think▷/g, "");

        // Convert markdown to HTML
        innerDiv.innerHTML = markdownParser(message.content); // Use markdownParser to convert to HTML
        messageDiv.appendChild(innerDiv);
        chatMessages.appendChild(messageDiv);
    });

    scrollToBottom(); // Scroll to the bottom of the chat messages
};

// function to store new messages in the database
// This function will be called when the user submits a new message and when the AI responds
// It will update the chat messages in the IndexedDB and display them in the chat window.
const storeMessage = (chatId, message) => {
    return new Promise((resolve, reject) => {
        const dbRequest = createDB();
        dbRequest.onsuccess = function () {
            const db = dbRequest.result;
            const transaction = db.transaction("chats", "readwrite");
            const store = transaction.objectStore("chats");
            const getRequest = store.get(chatId);
            getRequest.onsuccess = function () {
                const chat = getRequest.result;
                if (chat) {
                    chat.messages.push(message);
                    const updateRequest = store.put(chat);
                    updateRequest.onsuccess = function () {
                        resolve(chat); // Resolve with the updated chat object
                    }
                    updateRequest.onerror = function (event) {
                        reject(event.target.error);
                    }
                } else {
                    reject(new Error("Chat not found"));
                }
            }
            getRequest.onerror = function (event) {
                reject(event.target.error);
            }
        };
    });
};

const sendMessage = async (event, chatId) => {
    event.preventDefault(); // Prevent the form from submitting normally
    const messageInput = event.target.querySelector("input[type='text']");
    const messageContent = messageInput.value.trim();

    messageInput.value = ""; // Clear the input field after sending the message
    document.getElementById("send-message-button").disabled = true; // Disable the button to prevent multiple submissions
    document.getElementById("send-message-button").classList.add("bg-gray-400"); // Change button text to indicate sending

    //get the api key from the indexedDB
    const dbRequest = createDB();
    var apiKey = null; // Initialize apiKey variable
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("apiKey", "readonly");
        const store = transaction.objectStore("apiKey");
        const getRequest = store.get(1);
        getRequest.onsuccess = function () {
            apiKey = getRequest.result ? getRequest.result.key : null; // Get the API key from the IndexedDB
        };
    };

    if (messageContent) {
        try {
            const chat = await storeMessage(chatId, { role: "user", content: messageContent });

            // now send the message to the AI model and show loading till response is not generated
            const loadingMessage = { role: "assistant", content: "Loading..." };
            chat.messages.push(loadingMessage);
            loadChatMessages(chat);

            const url = 'https://openrouter.ai/api/v1/chat/completions';
            const options = {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, messages: chat.messages })
            };

            const response = await fetch(url, options);
            const data = await response.json();

            const updatedChat = await storeMessage(chatId, data.choices[0].message)
            loadChatMessages(updatedChat);

        } catch (error) {
            console.error(error);
        }
        document.getElementById("send-message-button").disabled = false; // Disable the button to prevent multiple submissions
        document.getElementById("send-message-button").classList.remove("bg-gray-400"); // Change button text to indicate sending
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Update the chat menu on page load
    updateChatMenu();
    // Retrieve the API key from IndexedDB and set it in the input field
    retrieveApiKey();

    //detect when the query parameter "id" is changed in the URL and open the chat with that id
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get("id");
    //check id chatId really exists in the chat list from indexedDB
    // get the array of all ids present in the objectStore
    const dbRequest = createDB();
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("chats", "readonly");
        const store = transaction.objectStore("chats");
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function () {
            const chats = getAllRequest.result;
            const chatIds = chats.map(chat => chat.id);
            const defaultChatId = chatIds.length > 0 ? chatIds[chatIds.length - 1] : createNewChat(); // Default to the first chat if available else create a new chat

            if (chatId && chatIds.includes(Number(chatId))) {
                openChat(Number(chatId)); // Open the chat with the specified IDt
            } else {
                window.location.href = `?id=${defaultChatId}`; // Redirect to a default chat
            }
        };
    }
});