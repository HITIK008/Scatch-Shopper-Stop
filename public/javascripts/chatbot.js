document.addEventListener("DOMContentLoaded", function () {
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotOpen = document.getElementById("chatbot-open");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotBody = document.getElementById("chatbot-body");

  const predefinedQA = {
    "hi": "Hello! How can I assist you today?",
    "hello": "Hi there! How can I help you?",
    "how to add to cart": "Click the '+' icon on a product card in the shop page to add it to your cart.",
    "how to remove from cart": "Go to your cart page and click the '-' button next to the product to decrease quantity, or remove it entirely if the quantity reaches zero.",
    "how to checkout": "From your cart, click 'Checkout', enter your payment details, and confirm the order.",
    "what is the shipping cost": "The shipping cost is a flat rate of ₹20 for all orders.",
    "track my order": "You can track your order in the 'Profile' section under 'Order History'.",
    "what payment methods are available": "We accept Card, UPI, Net Banking, and Wallet payments via Razorpay.",
    "how to contact support": "Visit the 'Contact' page or email us at support@scratchshopperstop.com.",
    "return policy": "We offer a 7-day return policy for unused items. Please contact support for details.",
    "bye": "Goodbye! Feel free to return if you need more help!",
    "thanks": "You're welcome! Anything else I can assist with?"
  };

  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = isUser ? "text-right mb-2" : "text-left mb-2";
    messageDiv.innerHTML = `
      <p class="inline-block p-3 rounded-lg shadow-sm max-w-[80%] ${
        isUser ? "bg-blue-100 text-blue-800" : "bg-white text-gray-800"
      }">${message}</p>
    `;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function toggleChatbot() {
    if (chatbotBody.style.display === "none" || chatbotBody.style.display === "") {
      chatbotBody.style.display = "flex";
      chatbotOpen.style.display = "none";
    } else {
      chatbotBody.style.display = "none";
      chatbotOpen.style.display = "block";
    }
  }

  chatbotOpen.addEventListener("click", toggleChatbot);
  chatbotClose.addEventListener("click", toggleChatbot);

  chatbotInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && chatbotInput.value.trim()) {
      const userQuery = chatbotInput.value.trim().toLowerCase();
      addMessage(userQuery, true);

      const response = predefinedQA[userQuery] || 
        "I'm not sure how to help with that. Try asking about cart, checkout, shipping, or support!";
      setTimeout(() => addMessage(response), 500);

      chatbotInput.value = "";
    }
  });

  // Initial Message
  addMessage("Hi! I'm here to assist you with shopping queries. How can I help?");
});