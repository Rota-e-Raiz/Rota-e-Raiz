document.getElementById('mainButton').addEventListener('click', function () {
    this.style.backgroundColor = '#D9D2B9';
    this.style.color = '#1F2A1F';

    setTimeout(function () {
        window.location.href = 'proxima.html';
    }, 300);
});

const track = document.querySelector('.carrossel-track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track && prevBtn && nextBtn) {
    const cards = Array.from(track.children);
    const visibleCards = window.innerWidth < 701 ? 1 : window.innerWidth < 1025 ? 2 : 3;
    let currentIndex = 0;

    function getStep() {
        const card = cards[0];
        if (!card) return 0;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap || '0');
        return card.getBoundingClientRect().width + gap;
    }

    function updateCarousel() {
        const maxIndex = Math.max(cards.length - visibleCards, 0);
        currentIndex = Math.min(currentIndex, maxIndex);
        track.style.transform = `translateX(-${currentIndex * getStep()}px)`;
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(cards.length - visibleCards, 0);
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : maxIndex;
        updateCarousel();
    });

    window.addEventListener('resize', () => {
        updateCarousel();
    });

    setInterval(() => {
        const maxIndex = Math.max(cards.length - visibleCards, 0);
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateCarousel();
    }, 3500);

    updateCarousel();
}
