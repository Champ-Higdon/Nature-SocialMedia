document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBilling').addEventListener('click', () => {
      // Get form values
      const fullName = document.getElementById('fullName').value;
      const cardNumber = document.getElementById('cardNumber').value;
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      
      // Clear any previous messages
      const confirmationMessage = document.getElementById('confirmationMessage');
      const errorMessage = document.getElementById('errorMessage');
      confirmationMessage.style.display = 'none';
      errorMessage.style.display = 'none';
  
      // Check if all required fields are filled
      if (!fullName || !cardNumber || !expiryDate || !cvv) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'All fields are required!';
        return;
      }
  
      // Simulate submitting the form (without actually sending data anywhere)
      setTimeout(() => {
        // Redirect to feed.html
        window.location.href = 'feed.html';
  
        // Show success confirmation (optional)
        confirmationMessage.style.display = 'block';
        confirmationMessage.textContent = 'Payment details have been submitted. Thank you!';
      }, 500); // Simulate a delay before redirecting
    });
  });
  