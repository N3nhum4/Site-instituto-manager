(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Function to remove problematic elements
    function removeMissingImageElements() {
      const missingImageElement = document.querySelector('[data-node-id="30-119"]');
      if (missingImageElement) {
        missingImageElement.remove();
      }
    }

    // Run the removal function
    removeMissingImageElements();

    // Also, observe for changes in case the element is added dynamically
    const observer = new MutationObserver((mutationsList, observer) => {
      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          removeMissingImageElements();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  const originalSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');

  Object.defineProperty(Image.prototype, 'src', {
    set: function(value) {
      let newValue = value;
      // Check if it's a path that needs correction
      if (typeof value === 'string' && value.startsWith('/assets/')) {
        newValue = '/site-completo' + value;
      }
      // Only set the src if the file is not one of the known missing ones
      if (typeof value !== 'string' || !value.includes('30-119-CYR_4l10.webp')) {
        originalSrc.set.call(this, newValue);
      }
    }
  });
})();