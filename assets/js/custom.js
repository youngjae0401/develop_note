function imagePopup(e) {
    let target = e.target;

    document.querySelector('#popup .content img').src = target.getAttribute('src');
    document.querySelector('body').classList.add('popup');
}

function closeImagePopup(e) {
    if(e.target === document.getElementById('popup')) {
        document.querySelector('#popup .content img').src = "";
        document.querySelector('body').classList.remove('popup');
    }
}

window.onload = function() {
    let images = document.querySelectorAll('.image');
    for(let i = 0; i < images.length; i++) {
        images[i].addEventListener("click",imagePopup);
    }

    window.addEventListener("click",closeImagePopup);
};