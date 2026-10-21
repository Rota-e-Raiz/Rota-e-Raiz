document.getElementById('mainButton').addEventListener('click', function () {
    this.style.backgroundColor = '#D9D2B9';
    this.style.color = '#1F2A1F';

    setTimeout(function () {
        window.location.href = 'proxima.html';
    }, 300);
});
