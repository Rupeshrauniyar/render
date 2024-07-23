var flag = 0;
const eyes = document.querySelector('#eyes');
var password = document.querySelector('#password');
eyes.addEventListener('click', function() {
if(flag === 0){
    flag = 1;
    eyes.classList= "fa-light fa-eye-slash ml-4 cursor-pointer"
    password.setAttribute('type', 'text');
}
else{
    flag = 0;
    eyes.classList= "fa-light fa-eye ml-4 cursor-pointer"
    password.setAttribute('type', 'password');
}
});