// слайдер
const swiper = new Swiper('.swiper', {
    loop: true,
    autoplay: {
        delay: 15000,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// цветок сакуры
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('sakura-container');
    const firstBackground = document.querySelector('.bg-top');
    
    updatePosition();
    window.addEventListener('scroll', updatePosition);
    
    function updatePosition() {
        const rect = firstBackground.getBoundingClientRect();
        
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            container.style.display = 'block';
            
            const visibleHeight = Math.min(rect.bottom, window.innerHeight - rect.top);
            container.style.height = visibleHeight + 'px';
            container.style.top = Math.max(0, rect.top) + 'px';
        } 
        
        else {
            container.style.display = 'none';
        }
    }
    
    setInterval(createFlower, 300);
    
    function createFlower() {
        if (container.style.display === 'none') return;
        if (container.children.length > 20) return;
        
        const flower = document.createElement('div');
        flower.className = 'sakura-flower';
        
        const size = 15 + Math.random() * 25;
        flower.style.width = size + 'px';
        flower.style.height = size + 'px';
        flower.style.left = Math.random() * 100 + '%';
        flower.style.animationDuration = (3 + Math.random() * 5) + 's';
        
        container.appendChild(flower);
        
        setTimeout(() => flower.remove(), 8000);
    }
});